# C++ vs Java vs C# — 왜 갈라졌나 (역사·철학)

> 관점: 세 언어는 **사촌**인데 왜 다를까? **C++는 C+Simula의 후손, Java는 C++에 대한 반작용, C#은 Java에 대한 반작용**(이면서 C++의 유용함을 되살림). "파생된 근거"를 창시자 발언·문서로 추적한다.
> 자바 렌즈 전반: [../ai-ml/for-java-devs.md](../ai-ml/for-java-devs.md) · Java 개념 [java/concept.md](java/concept.md) · C# [csharp/concept.md](csharp/concept.md).

---

## 0. 한 줄 계보 — 누가 무엇에 반응했나

```
1967 Simula (OOP의 시초: 클래스·상속)
1972 C (Ritchie, 시스템 프로그래밍)
        └→ 1983 C++  (Stroustrup): C의 성능 + Simula의 OOP
                └→ 1995 Java (Gosling): C++에서 "위험한 것"을 제거
                        └→ 2002 C# (Hejlsberg): Java + C++이 버린 유용함 복원 + 신기능
```

- **C++** = C에 OOP를 더함 (성능 유지)
- **Java** = C++ **빼기 위험한 부분** (포인터·수동 메모리·다중상속…)
- **C#** = Java **더하기 C++의 좋은 것** (값 타입·연산자 오버로딩·결정적 정리) **더하기 신기능**(LINQ·async)

---

## 1. 세 언어 한눈

| | C++ | Java | C# |
|---|-----|------|-----|
| **창시자** | Bjarne Stroustrup (Bell Labs) | James Gosling (Sun) | Anders Hejlsberg (MS, Turbo Pascal·Delphi 창시자) |
| **공개** | 1983/85 | **1995** | **2002** |
| **원래 문제** | Simula OOP를 **C 성능**으로 (시뮬레이션 연구) | 원래 **셋톱박스** → 인터넷용 이식·안전 언어 | **.NET/CLR** 플래그십 언어 (J++ 소송 이후) |
| **철학 한 줄** | "C에 최대한 가깝게 — **쓰지 않는 것엔 비용 없다**(zero-overhead)" | "**단순·객체지향·친숙**" — 위험/혼란한 걸 뺀다 | **실용·생산성** — 검증된 걸 빌리고 아픈 곳을 고친다 |

> Java 백서는 C++의 *"드물게 쓰이고, 잘 이해되지 않으며, 혼란스러운 기능들"* 을 뺐다고 밝힌다(Gosling & McGilton, 1995).

---

## 2. 핵심 갈림길 — 무엇이 왜 다른가

### ① 메모리 관리
| C++ | Java | C# |
|-----|------|-----|
| **수동**(`new`/`delete`, RAII) | **GC** | **GC** + 결정적 정리(`IDisposable`/`using`) |
- **왜 갈렸나**: C++는 **성능·예측 가능성**(GC 멈춤 없음). Java는 메모리 누수·댕글링 포인터를 **"용납 불가"**로 보고, 특히 **다운로드되는 모바일 코드**의 안전을 위해 GC 채택. C#은 GC를 따르되, C++ 개발자가 그리워한 **결정적 정리**(`using`)를 되살림.

### ② 컴파일 대상
| C++ | Java | C# |
|-----|------|-----|
| **네이티브 기계어** | **바이트코드 → JVM** (WORA) | **IL → CLR** (다언어) |
- **왜**: Java의 **"Write Once, Run Anywhere"** — 이기종 기기에서 돌게 **아키텍처 중립** 설계(셋톱박스·인터넷 출신). C#의 CLR은 한 발 더 나가 **여러 언어(C#·F#·VB)가 같은 IL로 상호운용**하도록 설계. VM을 쓰는 이유: 이식성 + **바이트코드 검증**(실행 전 타입·메모리 안전) + GC·리플렉션.

### ③ 포인터
| C++ | Java | C# |
|-----|------|-----|
| **raw 포인터**(+산술) | **없음**(참조만) | 참조 + `unsafe` 블록 안에서만 포인터 |
- **왜 Java가 뺐나**: 포인터는 **버그·보안 구멍의 주범.** 없애면 (1) 안전, (2) **GC가 객체를 자유롭게 이동** 가능, (3) 안전한 모바일 코드. C#은 "기본은 안전, 필요하면 `unsafe`로 책임지고" — 실용 절충.

### ④ 값 타입 vs 참조 타입
| C++ | Java | C# |
|-----|------|-----|
| 자유(스택/힙 선택) | **거의 참조**(원시 8개만 값, 박싱) | **`struct` 값 타입** + 통합 타입 시스템 |
- **왜 C#이 값 타입을 추가**: 박싱·힙 할당·GC 부담을 피하려고. Hejlsberg는 `List<int>`가 진짜 int이길 원했다 — 박싱해서 공유하는 건 *"엄청 비싼 방법"*이라고. (→ [java/types-boxing.md](java/types-boxing.md))

### ⑤ 제네릭 — 가장 큰 기술적 분기
| | 방식 | 결과 |
|---|------|------|
| **C++ 템플릿** | 컴파일 타임 코드 생성 | **코드 팽창**·난해한 에러 |
| **Java 제네릭** | **타입 소거**(런타임엔 `Object`) | **기존 JVM 하위호환**이 목적. 대가: `List<int>` 불가(박싱), 런타임 타입정보 없음 |
| **C# 제네릭** | **reified**(런타임에 진짜 타입, JIT가 특화) | `List<int>`가 진짜 int, 리플렉션 가능. 대가: **CLR 자체를 바꿔야** 했음 |
- **왜 다른가**: Sun은 **기존 JVM 생태계를 안 깨려고** 소거를 택했고, MS는 **CLR을 통제**하니 reified로 갈 수 있었다. (둘 다 2004~2005 비슷한 시기에 제네릭 도입, **정반대 구현**)

### ⑥ 다중 상속 / ⑦ 연산자 오버로딩 / ⑧ 소멸
| 기능 | C++ | Java | C# |
|------|-----|------|-----|
| 다중 상속 | 있음(다이아몬드 문제) | **인터페이스만** | **인터페이스만** |
| 연산자 오버로딩 | 있음 | **없음**(가독성) | **부활**(값 타입 때문) |
| 소멸 | **결정적 소멸자** | `finalize()`(폐기됨) | `IDisposable`+`using` |
- **다중상속**: Gosling은 *"이해·구현·올바른 사용이 어렵다"* 며 실용적으로 제거 — 인터페이스가 유용한 부분만 취함.
- **연산자 오버로딩**: Java는 `a + b`가 비싼 동작을 숨겨 가독성을 해친다고 제외. C#은 값 타입(`decimal`·벡터)에 자연스러워 되살림.

---

## 3. C#은 Java를 어떻게 "고쳤나" (자바 개발자가 불평하던 것)

| Java 불만 | C# 해법 | 이유 |
|-----------|---------|------|
| **Checked exception**(`throws` 폭증) | **없앰** | Hejlsberg: **버전 관리**(throws에 예외 추가 = 클라 코드 깨짐) + **확장성**(사람들이 우회해 오히려 품질 저하) |
| 타입 소거(박싱·런타임 정보 없음) | **reified 제네릭** | 런타임에 충실한 타입 |
| 값 타입 없음 | **`struct`** | 성능·박싱 회피 |
| getter/setter 보일러플레이트 | **프로퍼티** (`{ get; set; }`) | 언어 차원 지원 |
| 연산자 오버로딩 없음 | **부활** | 값 타입 연산에 필요 |
| 비결정적 `finalize` | **`IDisposable`+`using`** | 결정적 자원 정리 |
| — | **LINQ·async/await** | 데이터 질의·비동기를 언어에 통합 |

> 한 줄: **C# = "Java의 문법·안전 + Java가 버린 C++ 기능(값타입·연산자·결정적 정리·reified 제네릭) + 신기능(LINQ·async)".**

---

## 4. 자바 렌즈 — 세 언어 성격 한 줄

- **C++**: 성능·통제 우선. **프로그래머를 다 믿는다**(발등 찍을 자유까지).
- **Java**: 안전·단순·이식 우선. **위험한 걸 빼앗는다.**
- **C#**: 생산성·실용. **Java의 안전은 유지하고, C++의 유용함을 돌려주고, 계속 새 기능**을 얹는다.

Java를 안다면 C#은 사촌(→ [csharp/concept.md](csharp/concept.md)), C++는 "포인터·수동 메모리·템플릿을 되찾은 조상"이라고 보면 지도가 잡힌다.

---

## 한 줄 요약
**C++**(성능·통제, C+Simula) → **Java**(안전·단순, C++에서 위험 제거) → **C#**(실용, Java+C++장점+신기능). 갈림길은 **메모리(수동/GC)·컴파일(네이티브/VM)·포인터·값타입·제네릭(템플릿/소거/reified)** 이고, 각 선택엔 **성능 vs 안전 vs 생산성**이라는 서로 다른 우선순위가 깔려 있다.

## 출처
- Stroustrup, *A History of C++ (HOPL)* — https://www.stroustrup.com/hopl2.pdf
- Gosling & McGilton, *The Java Language Environment: A White Paper* (1995) — https://www.stroustrup.com/1995_Java_whitepaper.pdf
- Hejlsberg on generics (Artima) — https://www.artima.com/articles/generics-in-c-java-and-c
- Hejlsberg, *The Trouble with Checked Exceptions* (Artima) — https://www.artima.com/articles/the-trouble-with-checked-exceptions
- *Tips for Java Developers — A tour of C#* (Microsoft) — https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/tips-for-java-developers
