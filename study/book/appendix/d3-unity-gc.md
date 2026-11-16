# 부록 D 그래픽스와 Unity · D.3 Unity GC

> 부록

## 들어가며

'Unity에서 힙은 반환되나?'라는 질문에서 시작해, Incremental GC와 할당 줄이기, 공식 문서 기반의 Boehm GC 내부까지 본다. 3장의 GC 함정과 비교해 읽으면 좋다.

---

## Unity 가비지 컬렉션(GC) 정리 — "힙은 반환되나?"

> **출발점**: 넥슨 컨퍼런스 슬라이드 "힙은 한 번 커지면 반환되지 않음(Mono)" vs "유니티는 반환한다"는 얘기 — **어느 쪽이 맞나?**
> **결론(먼저)**: 둘 다 부분적으로 맞다. 유니티 힙은 **커지긴 쉽고 줄어들긴 어렵다.** 빈 페이지를 OS에 **돌려주기도 하지만 "보장 안 됨"**, 주소공간은 **절대 반환 안 함**, WebGL은 **아예 반환 안 함**. → 실무에선 **피크 사용량 = 상주 메모리**로 잡아야 안전.
> **관련**: 1장 추상화와 복잡도(Q3 메모리 단편화·OOM) · 부록 D 그래픽스

---

### 1. Unity GC의 기본 성격

- **Boehm–Demers–Weiser GC** 사용: **Mark & Sweep** 방식.
- **보수적(conservative)**: 메모리를 스캔해 **포인터처럼 보이는 값을 전부 "참조"로 간주**(진짜 포인터인지 확신 못 함) → 일부 쓰레기를 못 지울 수 있음.
- **비세대(non-generational)·비압축(non-compacting)**: 객체를 모아 정리(compaction)하지 않음 → **단편화**(fragmentation)가 남는다.
- **관리 힙(Managed Heap)만 대상**: `UnityEngine`의 **Native 영역**(텍스처·메시 등)은 GC가 안 건드림 → 별도 관리 필요.

**핵심 요약**: Unity GC는 보수적·비압축 Mark & Sweep. 압축을 안 해 단편화가 남고, 관리 힙만 청소한다.

---

### 2. 핵심: 힙이 커지면 OS에 반환되나?

| 질문 | 정확한 답 |
|------|-----------|
| 커진 힙이 바로 줄어드나? | **아니다.** 재확장 비용을 피하려 **일부러 비워도 붙잡고 있음**(optimistic). |
| 빈 페이지를 OS에 돌려주나? | **대부분 플랫폼에서 "언젠가는" 반환.** 단, **시점이 보장 안 되며 의존하면 안 됨.** |
| 주소공간(address space)은? | **절대 반환 안 함.** |
| WebGL은? | **전혀 반환 안 함** — 힙은 오직 커지기만 함. |
| 왜 잘 안 줄어드나? | **비압축 + 단편화** — 빈 공간이 조각나 큰 페이지를 통째로 못 비움. |

> 그래서 슬라이드의 "**피크 사용량이 곧 상주 메모리(중요)**"는 **실무 지침으로 옳다.** "언젠가 반환"에 기대지 말고 **최대 사용량 기준으로 메모리 예산**을 잡아야 한다.

**핵심 요약**: "반환한다"는 절반만 맞다 — 되기도 하지만 보장 없음·주소공간은 영구 점유·WebGL은 불가. 계획은 **피크=상주**로.

---

### 3. Incremental GC (Unity 2019+ 옵션)

- 문제: GC가 한 프레임에 몰아서 돌면 **GC spike**(순간 멈칫) → 게임 프레임 뚝뚝.
- 해결: **Mark 단계를 여러 프레임에 잘게 분할** → 한 번의 큰 멈춤을 여러 작은 조각으로 → **spike 완화**.
- 주의: 총 GC 작업량이 줄진 않음(스파이크를 분산할 뿐). 프레임 간 참조가 많이 바뀌면 효율↓.

**핵심 요약**: Incremental GC = Mark를 프레임 분할해 끊김(spike)을 완화. 총량을 줄이진 않는다.

---

### 4. Mono vs IL2CPP — GC는 같다

- **Mono / IL2CPP**는 **스크립팅 백엔드**(C# 실행 방식)의 차이. IL2CPP는 C#을 **C++로 변환**해 빌드(성능·플랫폼 이점).
- 하지만 **둘 다 GC는 Boehm**(보수적)을 쓴다 → GC 성격·힙 반환 특성은 **본질적으로 동일**.

---

### 5. 진짜 정답: "할당을 줄여라"

GC를 튜닝하기보다 **애초에 힙 할당(garbage)을 안 만드는 것**이 정석.

**힙 할당을 유발하는 것들 (주의)**
- **string 조작**: `a + b + c`처럼 이어붙이면 임시 문자열이 계속 생성.
- **boxing**: 값 타입(int 등)을 object로 감쌀 때 힙 할당.
- **람다 캡처(closure)**: 외부 변수를 캡처하는 람다 → 힙에 객체 생성.

**줄이는 기법**
- **struct(값 타입) 활용**: 힙 대신 스택/인라인.
- **풀링**: `ArrayPool`, `ObjectPool` — 재사용해 신규 할당 회피.
- `StringBuilder`: 반복 문자열 조합에.
- **`GC.Collect()` 강제 호출**: 실시간(게임 플레이) 중엔 금지 — **로딩 화면 등 비실시간 구간**에서만.

**핵심 요약**: GC를 이기는 법은 청소를 잘하는 게 아니라 **쓰레기를 안 만드는 것**. string·boxing·람다 캡처를 피하고 풀링·StringBuilder를 쓴다.

---

### 한 줄 결론
> Unity 힙은 **커지긴 쉽고 반환은 인색**하다(비압축·단편화). 빈 페이지를 OS에 돌려주긴 하나 **보장 없음**, 주소공간·WebGL은 사실상 영구 점유. → **피크=상주로 계획**하고, 근본 대책은 **할당 자체를 줄이는 것**.

### 검색 기록 (2026-07-15)
- 쿼리: `Unity garbage collection heap does not shrink return memory to OS Boehm GC managed heap`
- 쿼리: `Unity incremental GC Boehm IL2CPP heap release memory back to system`
- 확인: 힙은 잘 안 줄고, "대부분 플랫폼에서 빈 페이지는 언젠가 반환하나 보장 없음, 주소공간은 절대 반환 안 함, WebGL은 반환 안 함", IL2CPP도 Boehm 사용.

### 참조 출처
- Unity Manual – Understanding the managed heap — https://docs.unity3d.com/2020.1/Documentation/Manual/BestPracticeUnderstandingPerformanceInUnity4-1.html
- Unity Manual – Garbage collector overview — https://docs.unity3d.com/6000.1/Documentation/Manual/performance-garbage-collector.html
- Unity Manual – Incremental garbage collection — https://docs.unity3d.com/2021.2/Documentation/Manual/performance-incremental-garbage-collection.html
- Unity Blog – Feature Preview: Incremental GC — https://blog.unity.com/engine-platform/feature-preview-incremental-garbage-collection

_작성: 2026-07 · Unity 버전에 따라 세부 동작이 다를 수 있으므로 공식 매뉴얼 확인._

---

## 딥다이브 — Unity 가비지 컬렉션 내부 (공식 문서 기반)

> 기반: **Unity Manual – Garbage collector / Incremental GC / Understanding the managed heap** ([GC](https://docs.unity3d.com/6000.1/Documentation/Manual/performance-garbage-collector.html) · [Incremental](https://docs.unity3d.com/6000.1/Documentation/Manual/performance-incremental-garbage-collection.html))
> 형식: 12살 요약 → 내부 동작 심화. 얕은 버전은 D.3 Unity GC, D.3 Unity GC.

---

### 0. 30초 직관 — 청소부는 있는데, 방을 안 비운다

게임이 만든 물건(객체)들이 메모리에 쌓여요. 안 쓰는 걸 자동으로 치우는 청소부가 **GC**(가비지 컬렉션)예요. 그런데 이 청소부는 (1) 한 번에 몰아 치우면 게임이 **잠깐 멈칫**하고, (2) 넓힌 방(힙)을 잘 **안 돌려줘요**. 그래서 청소를 **여러 프레임에 나눠서**(Incremental) 하고, 근본적으로는 **쓰레기를 덜 만드는 것**이 답이에요. 아래는 그 내부 동작이에요.

---

### 1. 왜 GC가 있나

C/C++는 메모리를 **손으로** 할당·해제한다 → 실수하면 누수·크래시. Unity(C#)는 **GC**가 안 쓰는 메모리를 자동 회수한다. 편하지만 **언제·얼마나 오래 도는지 통제가 어렵다** → 게임의 프레임 끊김 원인.

Unity 매뉴얼: GC는 *"관리 힙의 모든 객체를 검사해, 앱이 더는 참조하지 않는 객체를 삭제 대상으로 표시(mark)"*한다.

---

### 2. Boehm-Demers-Weiser GC의 성격

Unity의 GC(Mono·IL2CPP 공통)는 **Boehm–Demers–Weiser** 방식. 세 가지 핵심 성질:

1. **보수적(conservative)**: 메모리를 훑어 **포인터처럼 보이는 값이면 전부 "참조"로 간주**한다. 진짜 포인터인지 100% 확신 못 하므로, 실제론 쓰레기인데 못 지우는 경우가 생길 수 있다(보수적으로 살려둠).
2. **비세대(non-generational)**: "새 객체 / 오래된 객체"를 구분해 자주 쓰는 영역만 빨리 청소하는 세대별 최적화가 **없다** → 매번 전체를 본다.
3. **비압축(non-compacting)**: 살아남은 객체를 한쪽으로 모아 **빈 공간을 합치지 않는다** → **단편화**(fragmentation)가 남는다.

기본 동작은 **Stop-The-World**(청소 동안 게임 정지) — 이걸 완화한 게 Incremental(5장).

---

### 3. Mark & Sweep 두 단계

1. **Mark(표시)**: 루트(스택·전역 등)에서 시작해 **도달 가능한(reachable) 객체를 전부 표시**. 표시 안 된 건 아무도 안 쓰는 쓰레기.
2. **Sweep(청소)**: 표시 안 된 객체의 메모리를 **회수해 재사용 목록에 넣는다.**

> 중요: Sweep은 메모리를 **관리 힙 안에서 재사용**하도록 되돌릴 뿐, 대부분 **OS에 바로 반환하지 않는다**(4장).

```mermaid
flowchart TD
  R["루트<br/>스택·전역 변수"] -->|"참조를 따라감"| M["도달 가능한 객체<br/>= 살아있음 (표시)"]
  M --> M2["연결된 객체도 계속 표시"]
  X["아무도 안 가리키는 객체<br/>= 쓰레기 (표시 안 됨)"] -->|"Sweep"| F["메모리 회수<br/>재사용 목록으로"]
  F -.->|"대부분 OS엔 안 돌려줌"| H["힙 안에 남겨둠"]
```

*(도식 설명: 루트에서 참조를 따라가 도달 가능한 객체를 '살아있음'으로 표시하고, 표시 안 된 쓰레기는 회수해 재사용 목록에 넣는다. 회수한 메모리는 대부분 OS로 안 돌려주고 힙에 남긴다.)*

---

### 4. 왜 힙이 안 줄어드나 (핵심)

- **비압축 + 단편화**: 객체가 여기저기 흩어져 죽으면, 빈칸이 조각나 **큰 페이지를 통째로 비우지 못한다** → 힙을 못 줄임.
- **낙관적 유지**: Unity는 재확장 비용을 피하려 넓힌 힙을 **일부러 붙잡는다**(비어 있어도).
- **반환 정책**(Understanding the managed heap):
  - 대부분 플랫폼에서 **빈 페이지를 "언젠가" OS에 반환**하나 **시점 보장 없음, 의존 금지**.
  - **주소공간(address space)은 절대 반환 안 함.**
  - **WebGL은 아예 반환 안 함** — 힙은 오직 커짐.
- 실무 결론: "**피크 사용량 = 상주 메모리**"로 메모리 예산을 잡아라.
- → 이건 CS의 "남은 메모리보다 작은데 OOM"(단편화)과 **같은 원리**. (→ 1장 추상화와 복잡도)

---

### 5. Incremental GC 상세 (2019+)

**문제**: Mark를 한 프레임에 다 하면 그 프레임이 **길게 멈칫(GC spike)**.

**해결**: Mark 단계를 **여러 프레임에 잘게 나눠** 수행. 매뉴얼: *"spreads out the process of garbage collection over multiple frames."*

#### 왜 어려운가 — 참조가 바뀐다
Mark를 조각내면, 조각 사이에 **객체의 참조가 바뀔 수 있다.** 그러면 이미 표시한 결과가 틀려진다. 매뉴얼: 참조가 바뀌면 *"the garbage collector must scan those objects again."* 참조가 **너무 자주** 바뀌면 *"the marking phase never finishes"* → **전체(비증분) GC로 되돌아간다(fallback).**

#### Write Barrier(쓰기 장벽)
이를 위해 Unity는 **write barrier** 코드를 자동 삽입 — *참조가 바뀔 때마다 GC에 "이 객체 다시 스캔해야 함"을 알려주는* 추가 코드. 이걸로 마킹 조각들 사이의 변경을 추적한다. (약간의 상시 오버헤드)

#### 한계
- **총 작업량은 안 줄어든다.** 매뉴얼: *"doesn't make garbage collection faster"* — 스파이크를 **분산**할 뿐.
- 프레임 간 참조 변경이 많으면 효율↓ / fallback 위험.
- **WebGL 미지원.**

---

### 6. 근본 해결 — 할당(garbage)을 줄여라 (심화)

GC 튜닝보다 **쓰레기를 안 만드는 것**이 정석. 힙 할당을 유발하는 것들과 대책:

| 유발 원인 | 왜 힙 할당 | 대책 |
|-----------|-----------|------|
| **string 조작** | `a+b+c`가 임시 문자열을 계속 생성 | `StringBuilder`, 캐싱 |
| **boxing** | 값 타입→object 감싸며 힙에 객체 (→ A.1 Java) | 제네릭·struct로 회피 |
| **람다 캡처(closure)** | 외부 변수 캡처 시 힙 객체 생성 | 캡처 없는 람다·정적 메서드 |
| **LINQ / foreach 일부** | 이터레이터·델리게이트 할당 | 핫패스에선 for 루프 |
| **컬렉션 재할당** | List 용량 초과 시 재할당 | 초기 용량 지정·풀링 |

- **풀링(Object Pool)**: 미리 만들어 재사용 → 신규 할당 회피.
- **struct(값 타입)**: 스택/인라인이라 GC 대상이 아님.
- **`GC.Collect()` 강제 호출**: 실시간 플레이 중 금지 — **로딩 화면 등 비실시간 구간**에서만.
- **측정 우선**: Unity **Profiler**의 GC Alloc 열로 "어디서 할당이 나는지" 먼저 찾아라. (추측 금지)

---

### 7. 연결 지도
- **박싱 → 힙 → GC**: Java·C#·Unity 공통 원리 (→ A.1 Java, A.2 다른 언어 (C++·C#·Kotlin)).
- **비압축 → 단편화 → OOM**: CS 메모리 개념과 동일 (→ 1장 추상화와 복잡도).

### 용어 사전
| 용어 | 뜻 |
|------|-----|
| 보수적 GC | 포인터처럼 보이면 참조로 간주 |
| Mark & Sweep | 도달 가능 표시 → 나머지 회수 |
| 비압축 | 객체를 모으지 않음 → 단편화 |
| 단편화 | 빈칸이 조각나 큰 공간 확보 실패 |
| Incremental GC | Mark를 여러 프레임에 분할 |
| Write Barrier | 참조 변경을 GC에 알리는 삽입 코드 |
| GC spike | 청소로 프레임이 순간 멈칫 |
| Object Pool | 객체 재사용으로 할당 회피 |

### 출처
- Unity Technologies. *Manual – Garbage collector overview.* — https://docs.unity3d.com/6000.1/Documentation/Manual/performance-garbage-collector.html
- Unity Technologies. *Manual – Incremental garbage collection.* — https://docs.unity3d.com/6000.1/Documentation/Manual/performance-incremental-garbage-collection.html
- Unity Technologies. *Manual – Understanding the managed heap.* — https://docs.unity3d.com/2020.1/Documentation/Manual/BestPracticeUnderstandingPerformanceInUnity4-1.html

_짧은 인용은 출처 표기. Unity 버전에 따라 세부는 달라질 수 있으니 최신 매뉴얼 확인._

---

## 정리 Q&A

### Unity — 암기 Q&A (얕게)

> 형식: **① 결론·WHAT / ② 원리·HOW / ③ 확장·TRADE-OFF**. 쉬운 말 위주.
> 개념 상세: D.3 Unity GC · 언어: A.2 다른 언어 (C++·C#·Kotlin)

---

#### Q1. 유니티 GC(가비지 컬렉션)가 뭐야?
- **① 결론** 안 쓰는 메모리를 자동으로 치워주는 기능(Boehm 방식).
- **② 원리** 메모리를 훑어 "아무도 안 쓰는" 객체를 찾아 회수(Mark & Sweep).
- **③ 확장** 편하지만 치우는 순간 게임이 잠깐 멈칫할 수 있다(GC spike).

#### Q2. 힙이 한번 커지면 돌려줘?
- **① 결론** 잘 안 돌려준다. **피크 사용량 = 상주 메모리**로 봐야 안전.
- **② 원리** 재확장 비용을 피하려 붙잡고, 비압축이라 조각(단편화)이 남아 못 줄인다.
- **③ 확장** 빈 페이지를 OS에 언젠가 반환하기도 하나 보장 없음. WebGL은 아예 안 돌려줌.

#### Q3. GC 끊김(spike)은 왜 생겨? 완화법은?
- **① 결론** GC가 한 프레임에 몰아서 돌면 순간 멈칫.
- **② 원리** Incremental GC(2019+)가 청소를 **여러 프레임에 나눠** 끊김을 줄인다.
- **③ 확장** 총 작업량이 주는 건 아니라 분산일 뿐. 근본 해결은 쓰레기(할당)를 줄이는 것.

#### Q4. 할당을 왜 줄여야 해? 어떻게?
- **① 결론** 새 객체를 적게 만들면 **GC가 돌 일 자체가 줄어** 끊김이 준다.
- **② 원리** string 조작·박싱·람다 캡처가 힙 할당을 유발.
- **③ 확장** struct 활용·ObjectPool 재사용·StringBuilder로 줄임. `GC.Collect()`는 로딩 등 비실시간에만.

#### Q5. Mono vs IL2CPP?
- **① 결론** C# 실행 방식의 차이. IL2CPP는 C#을 C++로 바꿔 빌드.
- **② 원리** IL2CPP는 성능·플랫폼 이점. 단 **GC는 둘 다 Boehm**으로 같다.
- **③ 확장** 그래서 힙 반환 특성·최적화 원칙은 두 방식이 동일하다.

_더 깊이(공식 문서 기반): **D.3 Unity GC** — Boehm GC·Mark&Sweep·Incremental·Write Barrier·할당 줄이기. 생명주기·ECS는 다음에._

---

## 함께 보기

- [1장 추상화와 복잡도](../part1/ch01-abstraction-and-complexity.md)
- [A.1 Java](a1-java.md)
- [A.2 다른 언어 (C++·C#·Kotlin)](a2-other-languages.md)
- [D.1 컴퓨터 그래픽스](d1-graphics.md)

---

## 다음으로

마지막 부록은 면접과 코딩테스트다.

👉 [부록 E 면접과 코딩테스트 · E.1 역량 로드맵과 코드 설명법](e1-roadmap-and-explain.md)
