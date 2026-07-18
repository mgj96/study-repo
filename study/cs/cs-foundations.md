# CS 근간 — 컴퓨터는 어떻게 돌아가나 (면접 + 뿌리)

> 관점: 자료구조 말고 **컴퓨터 그 자체의 뿌리**. 면접 단골이자 개념의 근간. 각 항목에 **★ = 딥다이브 우선순위** 표시. 자바 렌즈.
> 자료구조는 [data-structures-deep.md](data-structures-deep.md), GC는 [gc-gotchas.md](gc-gotchas.md), 통신은 [web-communication.md](web-communication.md).

---

## 0. 학습 순서 (의존성 순)
숫자 표현 → **컴퓨터 실행(메모리 계층)** → OS(동시성) → 복잡도 → 네트워크 → 종합(면접 토픽). 뒤로 갈수록 앞의 것을 재사용한다.

---

## 1. 컴퓨터가 코드를 실행하는 법

### 1.1 CPU — fetch·decode·execute
명령을 **가져와(fetch) → 해석(decode) → 실행(execute)** 를 클럭(예: 3GHz=초당 30억 틱)마다 반복. **레지스터**는 칩 위의 가장 빠른 저장소. 고수준 코드도 결국 이 사이클로 내려간다.

### 1.2 메모리 계층 ★★ — 현대 성능의 1순위 지렛대
빠름→느림: **레지스터 → L1 → L2 → L3 → RAM → SSD → 디스크 → 네트워크.** 데이터는 **캐시 라인(보통 64바이트)** 단위로 이동. **지역성(locality)** — 최근 것/가까운 것을 다시 쓰면 캐시가 먹힘.

| 연산 | 대략 지연 | 체감(×10억) |
|------|-----------|-------------|
| L1 캐시 | ~1 ns | 1초 |
| 분기 예측 실패 | ~3 ns | 3초 |
| Mutex lock/unlock | ~17 ns | 17초 |
| **RAM 접근** | ~100 ns | **~2분** |
| SSD 랜덤 읽기 | ~16 µs | ~4.5시간 |
| 데이터센터 왕복 | ~500 µs | ~6일 |
| **디스크 seek(HDD)** | ~2–10 ms | **수개월** |

> 외울 비율: **RAM은 L1보다 ~100배 느리고, 디스크 seek은 RAM보다 ~10만 배 느리다.** → 왜 `ArrayList`가 `LinkedList`를 실측에서 이기나(지역성), 왜 배열 순회 방향이 속도를 바꾸나가 다 여기서 나온다.
> ★ 딥다이브: 캐시 라인·false sharing(자바 동시성) · 데이터 지향 설계(배열 of 원시값).

### 1.3 스택 vs 힙 — 함수 호출의 기계장치
- **스택**: 스레드마다 하나. 함수 호출 시 **스택 프레임**(반환 주소·지역 변수·인자)을 쌓고, 리턴 시 팝. 빠르고 자동 회수. 너무 깊으면 **StackOverflowError**.
- **힙**: 공유. 자바는 **모든 객체가 힙**, 스택엔 원시값과 **참조**만. GC 관리.
- → StackOverflow vs OutOfMemory 차이, 지역 변수가 스레드 안전한 이유, 스택 트레이스의 정체.

### 1.4 컴파일 vs 인터프리트 vs JIT
- 컴파일(C): 소스 → 기계어(빠름·플랫폼 종속). 인터프리트(옛 파이썬): 한 줄씩(이식·느림).
- **자바 경로**: `.java` → (javac) → **바이트코드** → JVM이 **처음엔 해석** → **JIT(HotSpot)** 이 자주 도는 hot 메서드를 **런타임에 네이티브로** 컴파일(프로파일 기반 인라이닝). → "한 번 작성, 어디서나" + 준네이티브 속도. JVM 웜업의 이유.
- ★ 딥다이브: HotSpot 티어 컴파일·역최적화 · GraalVM AOT vs JIT.

---

## 2. 운영체제

### 2.1 프로세스 vs 스레드
- **프로세스** = 자기만의 **격리된 주소 공간**을 가진 실행 단위. **스레드** = 프로세스 안 실행 단위, **힙·코드 공유** + 각자 스택·레지스터.
- **컨텍스트 스위칭**: OS가 상태를 저장/복원해 한 코어로 여럿 돌림(비용 있음, 프로세스 전환이 더 비쌈).
- → 스레드는 싸게 통신(공유 메모리)하지만 위험(경쟁). 자바 `Thread` / 가상 스레드(Loom).

### 2.2 CPU 스케줄링
어떤 스레드를 다음에 돌릴지: FCFS·SJF·**라운드로빈**(타임슬라이스)·우선순위·**MLFQ**(대화형 우대). 선점형이라 타이머로 중단 가능.

### 2.3 가상 메모리·페이징 ★
프로세스마다 **사설 가상 주소 공간** → MMU가 **페이지 테이블**로 물리 주소로 변환(페이지 보통 4KB, **TLB**가 캐시). 없는 페이지 참조 시 **page fault** → 디스크에서 로드. 이점: **(1) 격리·보호, (2) 물리 RAM보다 큰 메모리(스왑), (3) 단순한 프로그래밍 모델.**
- ★ 딥다이브: 다단계 페이지 테이블·page fault · 페이지 교체(LRU/clock)·thrashing · copy-on-write(fork).

### 2.4 동시성 ★★★ — 가장 어렵고 가장 많이 물어봄
- **race condition**: 공유 가변 상태를 동기화 없이 접근 → `count++`(읽기-수정-쓰기)는 원자적이 아님 → 갱신 유실.
- **mutex/lock**: 임계 구역에 하나만. **원자성**: 나눌 수 없음(전부 아니면 전무).
- **deadlock**: 서로가 쥔 락을 순환 대기. **Coffman 4조건**(상호배제·점유대기·비선점·순환대기) 다 성립해야 → 하나 깨면 예방(예: 전역 락 순서).
- **자바 메모리 모델(JMM)**: 한 스레드의 쓰기가 **언제 다른 스레드에 보이나**를 정의.
  - `synchronized` → 상호배제 **+ happens-before**(가시성·순서).
  - `volatile` → 가시성·재정렬 방지(단 `x++` 원자성은 **아님**).
  - `happens-before`: A가 B보다 먼저면 A의 효과가 B에 보인다 — JMM의 핵심.
- ★ 딥다이브: **JMM happens-before, `volatile` vs `synchronized`** · CAS·lock-free·ABA · 데드락 예방(락 순서).

---

## 3. 숫자 표현

### 3.1 2의 보수·정수 오버플로
- 음수는 **2의 보수**(비트 반전+1) — 0이 하나, 덧셈 하드웨어 통일. 자바 `int`: −21억~+21억.
- **오버플로는 조용히 순환**: `Integer.MAX_VALUE + 1 == Integer.MIN_VALUE`(예외 없음). 유명 버그: 이진 탐색의 `(low+high)/2` 오버플로.

### 3.2 부동소수(IEEE 754) ★ — 왜 0.1 + 0.2 ≠ 0.3
- 실수는 `부호 × 가수 × 2^지수`. **2진법**이라 0.1은 유한 표현 불가(10진의 1/3처럼) → 반올림 오차 누적 → `0.1 + 0.2 = 0.30000000000000004`.
- **규칙: 돈 계산에 float/double 금지 → `BigDecimal` 또는 정수(센트).** float `==` 비교 금지(epsilon 사용).

### 3.3 유니코드·UTF-8 vs UTF-16
- **ASCII**(7비트, 영어) → **Unicode**(문자→코드포인트) → **UTF-8**(가변 길이 바이트 인코딩, 웹 표준, ASCII 호환).
- **문자 ≠ 바이트 ≠ 자바 `char`**. 자바 String은 **UTF-16** → 이모지는 **서로게이트 쌍**이라 `"😀".length() == 2`. I/O에 charset 명시 필수.

---

## 4. 네트워크

### 4.1 "google.com 치면 생기는 일" ★ (계층을 다 훑는 종합 질문)
1. 브라우저 캐시 확인 → 2. **DNS**로 이름→IP → 3. **TCP 3-way handshake**(SYN→SYN-ACK→ACK) → 4. **TLS**(HTTPS) → 5. **HTTP** 요청 → 6. 응답 → 7. 렌더링.

| TCP/IP 계층 | 예 |
|-------------|-----|
| 응용 | HTTP·DNS·TLS |
| 전송 | **TCP·UDP** |
| 인터넷 | IP |
| 링크 | Ethernet·Wi-Fi |

- **TCP**(연결·신뢰·순서, 웹·DB) vs **UDP**(비연결·저오버헤드, DNS·영상·게임). (→ [qna/network.md](qna/network.md))

---

## 5. 복잡도·계산 이론

- **Big-O**: 입력 n에 따른 증가율(상수 무시). O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ). **분할상환**(ArrayList add) 구분. (→ [concept.md](concept.md))
- **P vs NP** (쉽게): **P**=빨리 푼다, **NP**=빨리 **검증**한다(스도쿠 답은 즉시 확인, 풀기는 어려울 수). **NP-완전**=NP 중 최난이도(하나 빨리 풀면 다 풀림). **P=NP?** 는 미해결(대부분 P≠NP로 믿음). → 언제 완벽한 알고리즘 찾기를 **멈추고 휴리스틱**으로 갈지 알려줌.

---

## 6. 면접 단골 (종합 — 앞의 1~5를 재사용)

| 토픽 | 한 줄 | 연결 |
|------|-------|------|
| **해싱** | 키→고정 정수, 충돌은 체이닝/개방주소 | [data-structures-deep.md](data-structures-deep.md) |
| **HashMap 내부** ★ | 버킷+체이닝, 8개↑ 트리화, load 0.75 리사이즈 | [data-structures-deep.md](data-structures-deep.md) |
| **캐싱·LRU** | HashMap+이중연결리스트로 O(1) | [data-structures-deep.md](data-structures-deep.md) |
| **동시성 버그** | race·deadlock·visibility, 불변·락순서로 방어 | §2.4 |
| **GC·메모리 누수** | 도달 가능하면 못 치움, 세대별 GC | [gc-gotchas.md](gc-gotchas.md) |
| **REST** | 자원 URL+HTTP 메서드, 무상태·멱등 | [web-communication.md](web-communication.md) |
| **DB 인덱스(B+트리)** ★ | 얕은 고차 트리로 디스크 I/O 최소(메모리 계층!) | [data-structures-deep.md](data-structures-deep.md) |
| **ACID·트랜잭션** | 원자·일관·격리·지속, 격리수준 트레이드오프 | (DB 노트 예정) |

---

## ⭐ 시간 없으면 이것부터 (딥다이브 top 6)
1. **메모리 계층·캐시 라인** (§1.2) — 실무 성능 1순위
2. **JMM: `volatile` vs `synchronized`** (§2.4) — 가장 어렵고 최다 면접
3. **HashMap 내부** (§6) — 자바 내부 시그니처 질문
4. **가상 메모리·페이징** (§2.3) — OS의 마스터 추상화
5. **B+트리 DB 인덱스** (§6) — 자료구조 ↔ 디스크 지연 연결
6. **부동소수 0.1+0.2** (§3.2) — 작지만 즉시 실용

---

## 출처 (핵심)
- **CSAPP** — https://csapp.cs.cmu.edu/ · **OSTEP**(무료) — https://pages.cs.wisc.edu/~remzi/OSTEP/
- **Latency Numbers** — https://colin-scott.github.io/personal_website/research/interactive_latency.html
- **JMM (JSR-133 FAQ)** — https://www.cs.umd.edu/~pugh/java/memoryModel/jsr-133-faq.html · JLS Ch.17
- **부동소수(Goldberg)** — https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html
- **유니코드(Spolsky)** — https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/
- **DDIA**(인덱스·트랜잭션, Kleppmann) · **Use The Index, Luke** — https://use-the-index-luke.com/
