# Unity 가비지 컬렉션(GC) 정리 — "힙은 반환되나?"

> **출발점**: 넥슨 컨퍼런스 슬라이드 "힙은 한 번 커지면 반환되지 않음(Mono)" vs "유니티는 반환한다"는 얘기 — **어느 쪽이 맞나?**
> **결론(먼저)**: 둘 다 부분적으로 맞다. 유니티 힙은 **커지긴 쉽고 줄어들긴 어렵다.** 빈 페이지를 OS에 **돌려주기도 하지만 "보장 안 됨"**, 주소공간은 **절대 반환 안 함**, WebGL은 **아예 반환 안 함**. → 실무에선 **피크 사용량 = 상주 메모리**로 잡아야 안전.
> **관련**: [../cs/concept.md](../cs/concept.md)(Q3 메모리 단편화·OOM) · [../graphics/](../graphics/)

---

## 1. Unity GC의 기본 성격

- **Boehm–Demers–Weiser GC** 사용: **Mark & Sweep** 방식.
- **보수적(conservative)**: 메모리를 스캔해 **포인터처럼 보이는 값을 전부 "참조"로 간주**(진짜 포인터인지 확신 못 함) → 일부 쓰레기를 못 지울 수 있음.
- **비세대(non-generational)·비압축(non-compacting)**: 객체를 모아 정리(compaction)하지 않음 → **단편화(fragmentation)**가 남는다.
- **관리 힙(Managed Heap)만 대상**: `UnityEngine`의 **Native 영역**(텍스처·메시 등)은 GC가 안 건드림 → 별도 관리 필요.

**핵심 요약**: Unity GC는 보수적·비압축 Mark & Sweep. 압축을 안 해 단편화가 남고, 관리 힙만 청소한다.

---

## 2. 핵심: 힙이 커지면 OS에 반환되나?

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

## 3. Incremental GC (Unity 2019+ 옵션)

- 문제: GC가 한 프레임에 몰아서 돌면 **GC spike**(순간 멈칫) → 게임 프레임 뚝뚝.
- 해결: **Mark 단계를 여러 프레임에 잘게 분할** → 한 번의 큰 멈춤을 여러 작은 조각으로 → **spike 완화**.
- 주의: 총 GC 작업량이 줄진 않음(스파이크를 분산할 뿐). 프레임 간 참조가 많이 바뀌면 효율↓.

**핵심 요약**: Incremental GC = Mark를 프레임 분할해 끊김(spike)을 완화. 총량을 줄이진 않는다.

---

## 4. Mono vs IL2CPP — GC는 같다

- **Mono / IL2CPP**는 **스크립팅 백엔드**(C# 실행 방식)의 차이. IL2CPP는 C#을 **C++로 변환**해 빌드(성능·플랫폼 이점).
- 하지만 **둘 다 GC는 Boehm(보수적)** 을 쓴다 → GC 성격·힙 반환 특성은 **본질적으로 동일**.

---

## 5. 진짜 정답: "할당을 줄여라"

GC를 튜닝하기보다 **애초에 힙 할당(garbage)을 안 만드는 것**이 정석.

**힙 할당을 유발하는 것들 (주의)**
- **string 조작**: `a + b + c`처럼 이어붙이면 임시 문자열이 계속 생성.
- **boxing**: 값 타입(int 등)을 object로 감쌀 때 힙 할당.
- **람다 캡처(closure)**: 외부 변수를 캡처하는 람다 → 힙에 객체 생성.

**줄이는 기법**
- **struct(값 타입) 활용**: 힙 대신 스택/인라인.
- **풀링**: `ArrayPool`, `ObjectPool` — 재사용해 신규 할당 회피.
- **`StringBuilder`**: 반복 문자열 조합에.
- **`GC.Collect()` 강제 호출**: 실시간(게임 플레이) 중엔 금지 — **로딩 화면 등 비실시간 구간**에서만.

**핵심 요약**: GC를 이기는 법은 청소를 잘하는 게 아니라 **쓰레기를 안 만드는 것**. string·boxing·람다 캡처를 피하고 풀링·StringBuilder를 쓴다.

---

## 한 줄 결론
> Unity 힙은 **커지긴 쉽고 반환은 인색**하다(비압축·단편화). 빈 페이지를 OS에 돌려주긴 하나 **보장 없음**, 주소공간·WebGL은 사실상 영구 점유. → **피크=상주로 계획**하고, 근본 대책은 **할당 자체를 줄이는 것**.

## 검색 기록 (2026-07-15)
- 쿼리: `Unity garbage collection heap does not shrink return memory to OS Boehm GC managed heap`
- 쿼리: `Unity incremental GC Boehm IL2CPP heap release memory back to system`
- 확인: 힙은 잘 안 줄고, "대부분 플랫폼에서 빈 페이지는 언젠가 반환하나 보장 없음, 주소공간은 절대 반환 안 함, WebGL은 반환 안 함", IL2CPP도 Boehm 사용.

## 참조 출처
- Unity Manual – Understanding the managed heap — https://docs.unity3d.com/2020.1/Documentation/Manual/BestPracticeUnderstandingPerformanceInUnity4-1.html
- Unity Manual – Garbage collector overview — https://docs.unity3d.com/6000.1/Documentation/Manual/performance-garbage-collector.html
- Unity Manual – Incremental garbage collection — https://docs.unity3d.com/2021.2/Documentation/Manual/performance-incremental-garbage-collection.html
- Unity Blog – Feature Preview: Incremental GC — https://blog.unity.com/engine-platform/feature-preview-incremental-garbage-collection

_작성: 2026-07 · Unity 버전에 따라 세부 동작이 다를 수 있으므로 공식 매뉴얼 확인._
