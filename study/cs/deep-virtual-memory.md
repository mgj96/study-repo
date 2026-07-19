# 딥다이브 — 가상 메모리와 페이징

> Java 개발자를 위한 심층 노트. JVM 힙, GC, RSS가 왜 그렇게 움직이는지의 뿌리에는 전부 이 챕터가 있다.
> 관련 노트: [cs-foundations.md](cs-foundations.md) · [gc-gotchas.md](gc-gotchas.md) · [deep-memory-hierarchy.md](deep-memory-hierarchy.md)

---

## 0. 30초 직관 — 사물함 안내데스크(주소 통역사)

회사 로비에 사물함이 수백 개 있다. 그런데 당신이 받은 명함에는 "당신 사물함은 3번"이라고만 적혀 있다. 옆자리 동료의 명함에도 "당신 사물함은 3번"이라고 적혀 있다. 둘 다 3번인데 물건이 안 섞인다. 어떻게?

로비 **안내데스크(MMU)** 가 비밀을 쥐고 있다. 당신이 "3번 사물함 열어주세요"라고 하면, 안내데스크는 **당신 전용 장부(페이지 테이블)** 를 펼쳐 "아, 이 사람의 3번은 실제로는 물리 사물함 812번"이라고 통역해준다. 동료의 3번은 물리 447번으로 통역된다. 각자는 **"내 세상은 0번부터 시작한다"** 고 믿으며 편하게 살고, 충돌·보안·격리는 안내데스크가 책임진다.

- **가상 주소(virtual address)** = 명함에 적힌 번호 (프로세스가 보는 주소)
- **물리 주소(physical address)** = 실제 사물함 번호 (RAM 상의 위치)
- **MMU** = 통역해주는 하드웨어 안내데스크
- **페이지 테이블** = 프로세스별 통역 장부
- **TLB** = 안내데스크가 "방금 통역한 것"을 붙여둔 포스트잇 (다시 장부 안 펼쳐도 됨)

Java 렌즈로 미리 한 줄: `new byte[1<<30]` 으로 1GB를 "예약"해도, 실제 물리 RAM은 당신이 그 바이트를 **건드리는 순간**에야 한 페이지(4KB)씩 배정된다. 이게 뒤에서 다룰 **demand paging**이고, RSS가 `-Xmx`와 다르게 움직이는 이유의 절반이다.

---

## 1. 왜 가상 메모리가 존재하는가

물리 RAM을 프로세스가 직접 만지게 하면 세 가지가 무너진다. 가상 메모리는 이 셋을 한 번에 푼다.

### 1-1. 격리와 보호 (isolation / protection)
프로세스 A가 프로세스 B의 메모리를 우연히든 악의로든 읽거나 덮어쓰면 안 된다. 각 프로세스가 **자기만의 가상 주소 공간**을 가지면, A의 가상 주소 0x1000과 B의 가상 주소 0x1000은 서로 **다른 물리 페이지**로 매핑된다. 페이지 테이블에 없는 주소를 건드리면 하드웨어가 즉시 fault를 던진다(리눅스의 `SIGSEGV`). 커널 영역은 아예 유저 모드에서 매핑을 못 만지게 보호 비트로 막는다.

### 1-2. 물리 RAM보다 큰 메모리 사용 (overcommit)
16GB RAM에서 여러 프로세스가 합쳐 40GB를 "쓸" 수 있다. 실제로 동시에 **활발히 접근하는(working set)** 페이지만 RAM에 있으면 되고, 나머지는 디스크(swap/파일)에 내려둔다. 필요할 때 다시 올린다. 즉 RAM은 "느린 디스크에 대한 캐시"가 된다.

### 1-3. 단순하고 균일한 주소 공간 (0번부터 시작)
컴파일러·링커는 "이 프로그램은 주소 0x400000에 로드된다"고 **고정 가정**하고 코드를 만들 수 있다. 실제 물리 위치가 매번 달라도 상관없다. 각 프로세스는 깨끗한 연속 주소 공간(코드 / 데이터 / 힙 / 스택)을 갖는 것처럼 착각하고, 물리 파편화는 페이지 단위 매핑이 흡수한다. 동적 로딩·공유 라이브러리·`fork` 도 이 추상화 덕에 단순해진다.

---

## 2. 페이지와 페이지 테이블 — 주소는 어떻게 번역되는가

### 2-1. 페이지(page)와 프레임(frame)
메모리를 바이트 단위로 매핑하면 장부가 너무 커진다. 그래서 고정 크기 블록으로 자른다. 관례적으로 **4KB**(`2^12` 바이트).

- **page**: 가상 주소 공간의 4KB 블록
- **frame**(page frame): 물리 RAM의 4KB 블록
- 매핑은 "page → frame" 단위. 페이지 안의 오프셋은 번역해도 그대로다.

가상 주소는 두 부분으로 쪼개진다.

```text
가상 주소 (예: 48비트)
┌───────────────────────────┬──────────────┐
│   VPN (virtual page num)   │    offset    │
│      상위 비트              │  하위 12비트  │  ← 4KB=2^12 이므로 12비트
└───────────────────────────┴──────────────┘
         │                          │
         │ 페이지 테이블로 번역        │ 그대로 복사(번역 안 함)
         ▼                          ▼
┌───────────────────────────┬──────────────┐
│   PFN (physical frame num) │    offset    │
└───────────────────────────┴──────────────┘
      물리 주소
```

즉 **번역 대상은 페이지 번호(상위 비트)뿐**이고, offset(하위 12비트)은 그대로 붙는다.

### 2-2. 왜 다단계(multi-level) 페이지 테이블인가
64비트 주소 공간을 단일 배열 페이지 테이블로 만들면? 48비트 가상 주소 기준 VPN이 36비트 → 엔트리 `2^36`개 × 8바이트 = **512GB짜리 테이블**을 프로세스마다 갖는 셈. 불가능하다.

해법: 테이블 자체를 페이지로 쪼개고 **트리(다단계)** 로 만든다. 대부분의 주소 공간은 비어 있으므로, 쓰지 않는 가지는 아예 만들지 않는다(희소성 활용). x86-64는 보통 **4단계**(PML4 → PDPT → PD → PT), 최신은 5단계 옵션.

```text
가상 주소를 여러 인덱스로 쪼갠다:
[ idx1 | idx2 | idx3 | idx4 | offset ]

  CR3 레지스터(프로세스별 최상위 테이블 주소)
        │
        ▼
   ┌─────────┐  idx1   ┌─────────┐  idx2   ┌─────────┐  idx3  ┌─────────┐ idx4 ┌──────┐
   │ L4 table├────────►│ L3 table├────────►│ L2 table├───────►│ L1 table├─────►│ PFN  │
   └─────────┘         └─────────┘         └─────────┘        └─────────┘      └──────┘
                                                                                  │
                                                        PFN + offset = 물리 주소  ◄┘
```

각 단계 엔트리는 "다음 단계 테이블의 물리 주소" 또는 최종적으로 "PFN + 권한 비트"를 담는다. **문제**: 번역 한 번에 메모리 접근이 4번(각 단계 읽기) + 실제 데이터 접근 1번 = 5번. 이걸 그대로 두면 모든 메모리 접근이 5배 느려진다. 그래서 TLB가 필요하다.

### 2-3. 페이지 테이블 엔트리(PTE)의 권한/상태 비트
각 엔트리에는 PFN 외에 비트 플래그가 붙는다. 이게 보호와 demand paging의 핵심이다.

| 비트 | 의미 |
|---|---|
| **Valid / Present** | 이 페이지가 지금 RAM에 있나? 0이면 접근 시 page fault |
| **Read / Write / Execute** | 접근 권한. 코드 페이지는 R+X, 데이터는 R+W, 보안상 W와 X 동시 금지(W^X / NX bit) |
| **User / Supervisor** | 유저 모드에서 접근 가능한가 (커널 페이지 보호) |
| **Accessed (A)** | 최근에 접근됨 — 페이지 교체 알고리즘이 씀(뒤 clock 참고) |
| **Dirty (D)** | 쓰기가 일어남 — 내쫓을 때 디스크에 되써야 하는지 판단 |

`W`가 없는 페이지에 쓰면 **protection fault**. 이건 뒤의 **Copy-on-Write**를 구현하는 트릭이기도 하다.

---

## 3. TLB — 번역 캐시

### 3-1. TLB가 하는 일
**TLB(Translation Lookaside Buffer)** 는 MMU 안의 작은 하드웨어 캐시로, 최근에 번역한 "VPN → PFN + 권한"을 몇십~수천 개 저장한다. 안내데스크의 포스트잇이다.

- **TLB hit**: 포스트잇에서 바로 PFN을 찾음 → 페이지 테이블 안 뒤짐 → 거의 공짜(1 사이클 수준)
- **TLB miss**: 포스트잇에 없음 → **page table walk**(2-2의 다단계 순회)로 번역 → 결과를 TLB에 채움

TLB는 지역성(locality)에 강하게 의존한다. 4KB 페이지 하나 안에서 순차 접근하면 첫 접근만 miss고 나머지는 전부 hit. 그래서 **순차 접근이 랜덤 접근보다 빠른 이유**의 일부가 여기 있다(캐시 라인 지역성 + TLB 지역성).

### 3-2. TLB miss 비용
TLB miss는 4단계 페이지 테이블이면 최악 4번의 메모리 접근을 유발한다. 각 접근이 캐시에 없으면 수백 사이클씩. 그래서 대용량 데이터를 **랜덤하게** 휘젓는 워크로드(해시 조인, 포인터 추적 자료구조)는 TLB miss 폭발로 느려진다.

### 3-3. 문맥 전환과 TLB flush
프로세스가 바뀌면 번역 규칙도 바뀐다. 순진하게는 문맥 전환 때 TLB를 통째로 비워야(flush) 한다 → 전환 직후 TLB miss 쏟아짐. 현대 CPU는 **ASID/PCID**(주소공간 태그)를 엔트리에 붙여, 프로세스별 엔트리를 구분 보관해 flush를 피한다.

> **huge page의 진짜 이득이 여기서 나온다.** 4KB 대신 2MB 페이지를 쓰면 같은 메모리를 훨씬 적은 TLB 엔트리로 커버한다(2MB = 4KB 512개). 큰 힙을 휘젓는 JVM에서 **TLB miss가 급감**한다. 뒤 8장에서 다시.

---

## 4. Demand Paging과 페이지 폴트

### 4-1. 게으른 할당 (lazy allocation)
프로세스가 메모리를 "요청"(예: `malloc`, `mmap`, JVM의 힙 예약)해도 OS는 물리 프레임을 즉시 주지 않는다. PTE만 만들어두되 **Present=0** 으로 두거나 매핑만 등록한다. 실제 그 페이지를 **접근하는 순간** 하드웨어가 page fault를 일으키고, 그제서야 커널이 물리 프레임을 배정한다. 이게 **demand paging**.

### 4-2. 페이지 폴트 흐름
```text
1. CPU가 가상 주소 접근
2. MMU: TLB miss → page table walk
3. PTE의 Present=0  (또는 권한 위반)  → 하드웨어가 page fault 예외 발생, 커널로 트랩
4. 커널 page fault 핸들러가 원인 판별:
     ├─ 이 주소가 합법적으로 매핑된 영역인가?  아니면 → SIGSEGV (진짜 잘못된 접근)
     ├─ 데이터가 이미 RAM 어딘가(파일 캐시/공유)에 있나? → 그냥 PTE 연결만  ... (minor fault)
     └─ 데이터가 디스크(swap/파일)에 있나?          → 디스크 I/O로 읽어와 프레임 채움 ... (major fault)
5. 빈 물리 프레임 확보 (없으면 page replacement로 하나 내쫓음 → 5장)
6. PTE를 Present=1, 올바른 PFN/권한으로 갱신, TLB 채움
7. 폴트를 일으킨 명령을 재실행 → 이번엔 성공
```

### 4-3. minor fault vs major fault (중요)
- **minor(soft) fault**: 디스크 I/O 없음. 데이터가 이미 물리 RAM에 있는데(파일 페이지 캐시, 다른 프로세스와 공유, zero-page 등) 단지 이 프로세스의 PTE에 연결만 안 돼 있던 경우. **마이크로초** 수준. — JVM이 갓 커밋된 힙 페이지를 처음 만질 때 대부분 여기.
- **major(hard) fault**: 데이터를 **디스크에서 읽어와야** 함. **밀리초** 수준(HDD면 수 ms, SSD면 수십~수백 μs). 이게 폭증하면 그게 **thrashing**(5-3).

리눅스에서 `ps -o min_flt,maj_flt` 또는 `/proc/<pid>/stat` 로 프로세스별 minor/major fault 수를 볼 수 있다. **major fault가 계속 오른다 = 메모리 부족으로 swap 중**이라는 강력한 신호.

---

## 5. 페이지 교체와 스래싱

RAM이 꽉 찼는데 새 프레임이 필요하면, 기존 페이지 하나를 골라 내보내야(evict) 한다. Dirty면 디스크에 되쓴 뒤(write-back), Clean이면 그냥 버린다. **누구를 내보내나?** = 페이지 교체 알고리즘.

### 5-1. FIFO
가장 오래 "들어온" 페이지를 내보낸다. 구현 단순. 문제: 오래됐어도 계속 쓰이는 페이지를 내쫓을 수 있고, **Belady's anomaly**(프레임을 늘렸는데 폴트가 오히려 늘어나는 역설)가 있다.

### 5-2. LRU와 그 근사 (clock / second-chance)
**LRU(Least Recently Used)**: "가장 오래 안 쓰인" 페이지를 내보낸다. 지역성 가정에서 이론적으로 매우 좋다. 하지만 **정확한 LRU는 비싸다** — 매 접근마다 타임스탬프/순서를 갱신해야 하는데, 이건 하드웨어가 매 메모리 접근에서 해줄 수 없다.

그래서 실제 OS는 **근사**한다. 핵심 재료는 PTE의 **Accessed 비트(A)**. 하드웨어가 페이지를 만질 때마다 A=1로 세팅해준다.

**Clock (second-chance) 알고리즘**:
```text
프레임들을 원형(시계)으로 배열, 바늘(hand)이 돈다.

내쫓을 후보를 찾을 때 바늘이 가리키는 페이지를 본다:
   A비트 == 1 ?  →  "한 번 더 기회" : A=0으로 지우고 바늘 다음으로 (안 내쫓음)
   A비트 == 0 ?  →  이 페이지를 내쫓는다 (최근에 안 쓰였다는 뜻)

즉 A=1인 애들을 한 바퀴 돌며 0으로 리셋 → 다음 바퀴까지도 안 쓰이면 결국 내쫓김.
```
이렇게 하면 "최근에 안 쓰인" 페이지를 대략 골라내면서도, 매 접근마다 뭔가 갱신할 필요 없이 A비트 하나로 근사한다. 실제 리눅스는 이보다 정교한 **active/inactive LRU 리스트** 2개를 쓰지만, 정신은 clock과 같다. Dirty 비트도 함께 봐서 "clean이면서 오래된" 페이지를 우선 내쫓는다(되쓰기 비용 회피).

### 5-3. 스래싱 (thrashing)
활발히 쓰이는 페이지 총합(**working set**)이 물리 RAM보다 커지면, 방금 내쫓은 페이지를 곧바로 다시 불러오는 악순환에 빠진다. CPU는 대부분의 시간을 계산이 아니라 **major fault(디스크 I/O) 대기**에 쓴다. 처리량이 절벽처럼 떨어지고, 시스템이 "먹통"처럼 느껴진다.

```text
처리량
  │        ┌──────────  (working set이 RAM에 들어올 때: 잘 돎)
  │       /
  │      /
  │     /
  │____/ ╲________________  ← working set > RAM 넘는 순간 절벽(thrashing)
  │       ╲___
  └───────────────────────► 부하(동시 활성 페이지)
```

대응: working set을 줄이거나(메모리 아끼기), RAM을 늘리거나, 부하를 낮춘다. Java에서는 **`-Xmx`를 물리 RAM보다 크게 잡는 것**이 전형적 자살골 — GC가 힙 전체를 훑는 순간(5장 + 9장) major fault가 폭발한다.

### 5-4. Swap
내쫓긴 **익명 페이지(anonymous page: 파일 배경이 없는 힙/스택 데이터)** 를 담아두는 디스크 영역이 **swap**(리눅스 swap 파티션/파일, 윈도우 pagefile). 파일 기반 페이지는 원본 파일이 곧 백업이라 swap이 필요 없지만, 익명 페이지는 갈 곳이 swap뿐이다. Swap-in = major fault. `swappiness` 로 커널이 얼마나 적극적으로 swap할지 조절한다.

> **컨테이너/JVM 실전 팁**: 프로덕션 JVM은 보통 **swap을 끄거나 최소화**한다. GC 중 힙 페이지가 swap에 나가 있으면 "stop-the-world"가 디스크 대기로 수백 ms~초 단위로 늘어져 SLA를 박살낸다. 차라리 OOM으로 죽는 게 낫다는 판단.

---

## 6. Copy-on-Write, mmap — 페이지 매핑의 응용

### 6-1. Copy-on-Write (fork)
`fork()`로 자식 프로세스를 만들 때 부모의 전체 메모리를 복사하면 느리고 낭비다(자식이 곧 `exec`하면 다 버릴 메모리). 대신:

```text
fork 직후:
  부모 페이지 ─┐
              ├─► 같은 물리 프레임 (둘 다 READ-ONLY로 매핑)
  자식 페이지 ─┘

둘 중 하나가 그 페이지에 '쓰기' 시도:
  → 페이지가 read-only라 protection fault
  → 커널이 그 페이지만 실제로 복사, 쓰는 쪽에 개인 사본을 W권한으로 매핑
  → 나머지 안 건드린 페이지는 계속 공유
```

즉 **쓰는 페이지만, 쓰는 순간에** 복사한다. 읽기만 하는 방대한 메모리는 계속 공유 → `fork`가 싸진다. 실행 파일의 코드 페이지, 공유 라이브러리도 여러 프로세스가 read-only 공유한다.

> Java에서 `Runtime.exec`/`ProcessBuilder`가 내부적으로 `fork`+`exec`을 쓰면, 거대한 힙을 가진 JVM에서 순간적으로 페이지 테이블을 복제하느라 지연이 생길 수 있다(그래서 `posix_spawn`/vfork 최적화가 등장). CoW 덕에 힙 전체를 물리 복사하진 않지만 매핑 구조 복제 비용은 남는다.

### 6-2. 메모리 맵 파일 (mmap)
`mmap`은 파일(또는 익명 영역)을 프로세스 주소 공간에 **직접 매핑**한다. 파일을 `read()`로 버퍼에 퍼오는 대신, 파일이 곧 메모리인 것처럼 포인터로 접근한다.

- 접근한 페이지만 demand paging으로 올라온다(파일 전체를 안 읽어도 됨).
- 여러 프로세스가 같은 파일을 mmap하면 **페이지 캐시를 공유** → 메모리 절약.
- 쓰기는 dirty 페이지가 되어 커널이 나중에 파일로 flush.

Java에서는 이게 **`MappedByteBuffer`**(`FileChannel.map`) 이고, Netty·Kafka·Lucene·RocksDB류가 대용량 파일을 이걸로 다룬다. 이때 쓰는 메모리는 **힙 밖(off-heap)** 이라 `-Xmx`에 안 잡히고 RSS에만 잡힌다 — 다음 장의 "RSS가 `-Xmx`를 초과하는" 또 하나의 이유.

---

## 7. 왜 페이지 폴트는 캐시 히트보다 ~10만 배 느린가 — 메모리 계층과의 연결

이 노트의 모든 것은 결국 **속도 계층(latency hierarchy)** 위에 있다. 대략적인 크기 감각(자세히는 [deep-memory-hierarchy.md](deep-memory-hierarchy.md)):

| 접근 대상 | 대략 지연 | "1 사이클 = 1초"로 환산하면 |
|---|---|---|
| L1 캐시 히트 | ~1 ns | 1초 |
| TLB 히트 후 L1 | ~1 ns | 1초 |
| 메인 메모리(DRAM) | ~100 ns | 약 1분 40초 |
| TLB miss + page walk | 수백 ns | 몇 분 |
| **major page fault (SSD)** | ~수십~수백 μs | 몇 시간 |
| **major page fault (HDD seek)** | ~10 ms | **약 4개월** |

`10 ms / 1 ns = 10,000,000` 배지만, "캐시 히트(~1ns) 대비 디스크 폴트(~0.1ms SSD)"만 잡아도 **10만 배**가 나온다. 핵심 직관:

> **RAM에 있으면(minor fault) 마이크로초, 디스크로 내려갔으면(major fault) 밀리초.** 이 3~5자릿수 절벽이 thrashing이 왜 그렇게 파괴적인지, GC가 왜 swap 위에서 죽는지를 전부 설명한다.

그래서 성능 튜닝의 제1원칙은 **working set을 물리 RAM 안에 유지**해서 major fault를 0에 가깝게 만드는 것이다.

---

## 8. Java 렌즈 — JVM 힙, RSS, huge page

### 8-1. reserved vs committed (예약 vs 커밋)
JVM은 시작 시 힙을 위해 가상 주소 공간을 **예약(reserve)** 한다. 예약은 "이 주소 범위는 내가 쓸 거야"라는 가상 공간 표시일 뿐, 물리 RAM은 아직 0바이트다. 실제로 그 페이지에 객체를 쓰기 시작하면 **커밋(commit)** 되어 물리 프레임이 demand paging으로 배정된다.

- `-Xms`(초기 힙) = 시작 시 커밋하려는 크기
- `-Xmx`(최대 힙) = 예약 상한
- `-Xms == -Xmx` 로 잡으면 시작 때 다 커밋(+ `-XX:+AlwaysPreTouch`면 모든 페이지를 미리 만져 물리 배정까지 강제) → 런타임 중 페이지 폴트로 인한 지연 스파이크를 없앰. 대신 기동이 느려지고 즉시 RAM을 다 먹는다.

### 8-2. 왜 RSS가 `-Xmx`를 초과하는가
RSS(Resident Set Size, 실제 물리 RAM 점유)는 힙만이 아니다. `-Xmx`는 **Java 힙**의 상한일 뿐이고, JVM 프로세스의 RSS에는 이게 다 더해진다:

- **Java 힙** (`-Xmx` 범위, 단 커밋·터치된 페이지만)
- **Metaspace / 클래스 메타데이터** (힙 밖, 네이티브)
- **스레드 스택** (스레드당 ~1MB × 스레드 수)
- **JIT 코드 캐시** (컴파일된 네이티브 코드)
- **GC 자체 자료구조** (카드 테이블, remembered set, 마킹 비트맵 등)
- **Direct ByteBuffer / off-heap** (`ByteBuffer.allocateDirect`, Netty 풀)
- **`MappedByteBuffer`(mmap)** — 6-2에서 본 파일 매핑 페이지
- **네이티브 라이브러리**(JNI)의 `malloc`

그래서 `-Xmx4g`인데 RSS가 5~6GB인 건 정상이다. 컨테이너 메모리 한도를 `-Xmx`에 딱 맞춰 잡으면 **위 오버헤드 때문에 OOMKill** 난다. Native Memory Tracking(`-XX:NativeMemoryTracking=summary`, `jcmd VM.native_memory`)으로 구성 요소를 뜯어볼 수 있다.

### 8-3. huge page (대용량 페이지)
큰 힙(수 GB~수십 GB)을 4KB 페이지로 매핑하면 **TLB 엔트리가 부족**해 TLB miss가 잦다(3-3). 2MB huge page를 쓰면 같은 힙을 512배 적은 TLB 엔트리로 커버 → **TLB miss 급감, 처리량 향상**. JVM 옵션:

- `-XX:+UseLargePages` (+ OS의 hugepage 예약 설정)
- `-XX:+UseTransparentHugePages` (리눅스 THP 사용; 다만 THP는 지연 스파이크 이슈로 DB/저지연 서비스에선 끄기도 함)

트레이드오프: huge page는 예약이 크고 유연성이 낮으며, THP의 백그라운드 compaction이 예측 못 할 지연을 만들 수 있다.

### 8-4. 왜 힙 전체를 훑는 GC가 페이지 폴트를 유발하는가
이게 이 노트의 클라이맥스다. GC 중 특히 **full GC / old 영역 마킹·컴팩션**은 힙 곳곳의 객체 그래프를 따라 포인터를 추적하며 **힙 전체를 넓게 만진다**. 여기서 두 가지가 터진다:

1. **swap 위에 있으면 major fault 폭발**: 오랫동안 안 만진 old 영역 페이지가 커널에 의해 swap으로 내려가 있었다면, GC가 그걸 만지는 순간 하나하나가 **디스크 I/O(major fault, ms 단위)**. 힙 페이지 수만 개 × ms = stop-the-world가 수백 ms~수 초로 늘어진다. → 5-4에서 "프로덕션 JVM은 swap을 끈다"고 한 이유.

2. **TLB/캐시 미스 폭발**: swap이 아니어도, 힙 전역을 랜덤에 가깝게 포인터 추적하면 TLB miss와 캐시 미스가 쏟아져 GC의 CPU 비용 자체가 커진다. huge page(8-3)와 지역성 좋은 GC(G1/ZGC의 region 국소성)가 이걸 완화한다.

> 정리: **"GC 지연이 가끔 튄다"의 상당수는 자바가 아니라 그 아래 페이징 계층의 major fault다.** 힙을 RAM 안에 가두고(working set ⊂ RAM), swap을 억제하고, 필요하면 `AlwaysPreTouch`로 미리 물리 배정하고, huge page로 TLB 압력을 낮추는 것이 근본 처방이다. 자세한 GC 함정은 [gc-gotchas.md](gc-gotchas.md).

---

## 9. 용어 사전

| 용어 | 뜻 (한 줄) |
|---|---|
| 가상 주소 / 물리 주소 | 프로세스가 보는 주소 / 실제 RAM 상의 주소 |
| VPN / PFN | 가상 페이지 번호 / 물리 프레임 번호 |
| MMU | 가상→물리 번역을 수행하는 하드웨어 |
| 페이지 / 프레임 | 가상 공간의 4KB 블록 / 물리 RAM의 4KB 블록 |
| 페이지 테이블 | 프로세스별 VPN→PFN 매핑 장부(보통 다단계 트리) |
| PTE | 페이지 테이블 엔트리 (PFN + 권한/present/dirty/accessed 비트) |
| TLB | 최근 번역을 캐싱하는 MMU 내 하드웨어 캐시 |
| page table walk | TLB miss 시 다단계 테이블을 순회해 번역하는 과정 |
| demand paging | 접근하는 순간에야 물리 프레임을 배정하는 지연 할당 |
| page fault | 접근한 페이지가 present가 아니거나 권한 위반 시 발생하는 예외 |
| minor / major fault | 디스크 I/O 없음(RAM에 이미 있음) / 디스크에서 읽어와야 함 |
| page replacement | RAM이 꽉 찼을 때 내보낼 페이지를 고르는 정책(FIFO/LRU/clock) |
| clock / second-chance | Accessed 비트로 LRU를 근사하는 교체 알고리즘 |
| thrashing | working set이 RAM을 초과해 major fault로 시스템이 마비되는 상태 |
| swap | 내쫓긴 익명 페이지를 저장하는 디스크 영역 |
| working set | 프로세스가 현재 활발히 접근하는 페이지 집합 |
| Copy-on-Write | fork 시 공유 후, 쓰는 페이지만 쓰는 순간 복사 |
| mmap / MappedByteBuffer | 파일을 주소 공간에 직접 매핑 / 그 Java API |
| huge page | 4KB 대신 2MB(등) 큰 페이지로 TLB 압력을 낮춤 |
| reserved / committed | 가상 주소만 확보 / 물리 프레임까지 배정 |
| RSS | 프로세스가 실제 점유한 물리 RAM 크기 |

---

## 10. 출처

- **OSTEP (Operating Systems: Three Easy Pieces)**, Remzi & Andrea Arpaci-Dusseau — 무료 챕터: 주소 변환, 페이징 소개, TLB, 다단계 페이지 테이블, swapping/교체 정책. https://pages.cs.wisc.edu/~remzi/OSTEP/
  - Paging: Introduction / Faster Translations (TLBs) / Smaller Tables / Swapping: Mechanisms / Swapping: Policies 챕터.
- **CSAPP (Computer Systems: A Programmer's Perspective)**, Bryant & O'Hallaron — Chapter 9 Virtual Memory (주소 변환, TLB, demand paging, CoW, mmap, 메모리 매핑). https://csapp.cs.cmu.edu/
- 리눅스 커널 문서 / `man mmap`, `man 5 proc`(min_flt/maj_flt), Transparent Huge Pages 문서 — 실전 확인용.
- JVM: OpenJDK Native Memory Tracking, `-XX:+AlwaysPreTouch`, `-XX:+UseLargePages`, `-XX:+UseTransparentHugePages` 관련 HotSpot 문서.

> 다음 읽을거리: [deep-memory-hierarchy.md](deep-memory-hierarchy.md) (캐시·지연 계층의 뿌리) · [gc-gotchas.md](gc-gotchas.md) (여기 8-4의 실전 확장) · [cs-foundations.md](cs-foundations.md) (OS 기초 인덱스)
