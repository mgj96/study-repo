# Java ↔ C# — 툴팁식 비교 + C# 개발 가이드

> "자바에선 이렇게 하는데 C#에선?" 을 **개념 → Java → C#** 로 빠르게 찾는 참조.
> 디자인 패턴·설계는 그대로 옮겨가고([공통](language-agnostic-fundamentals.md)), 여기선 **관용구 차이**만.
> NotebookLM에 넣고 "C#에서 X는 어떻게?" 물으면 툴팁처럼 답이 나온다.

## 1. 언어 기능 대조 (개념 → Java → C#)

| 개념 | Java | C# | 메모 |
|------|------|-----|------|
| 프로퍼티 | `getX()/setX()` 메서드 | **프로퍼티** `public int X { get; set; }` | C#은 필드처럼 쓰되 캡슐화 |
| 컬렉션 질의 | Stream + 람다 | **LINQ** `list.Where(x=>...).Select(...)` | LINQ가 더 간결, DB·XML도 질의 |
| 비동기 | `CompletableFuture` | **`async/await`** | C#이 훨씬 단순. 자바엔 async 키워드 없음 |
| 콜백/이벤트 | 함수형 인터페이스, 익명클래스 | **`delegate`/`event`**, `Func<>`,`Action<>` | C#은 일급 함수형 타입 내장 |
| 값 타입 | (없음) 모두 참조 | **`struct`** = 값 타입 | C# struct는 복사됨(스택), class는 참조 |
| 제네릭 | 타입 소거(erasure) → 박싱/캐스팅 | **reified**(런타임에 실제 타입) | C# 제네릭이 성능·표현력↑ |
| null 처리 | `Optional<T>` | **nullable `T?`**, `??`, `?.` | C#은 언어 차원 null 연산자 |
| 불변 DTO | record (Java 16+) | **`record`** | 둘 다 있음(개념 유사) |
| 확장 | 상속/유틸 클래스 | **확장 메서드** `this` 매개변수 | C#은 기존 타입에 메서드 추가 가능 |
| 패키지/모듈 | `package` | **`namespace`** | 폴더≠namespace (C#은 명시) |
| 진입점 | `public static void main` | `Main` 또는 top-level statements | |

## 2. 디자인 패턴 — 같은 패턴, C#은 언어 기능으로 더 짧게

당신의 패턴 지식은 그대로 쓰되, C#은 종종 **언어 기능이 패턴을 대신**한다:

| 패턴 | Java 관용 | C# 관용 |
|------|----------|---------|
| Observer | 인터페이스 + 리스너 등록 | **`event`/`delegate`** (내장) |
| Strategy | 인터페이스 구현 주입 | **`Func<>`/`Action<>`** 또는 인터페이스 |
| Iterator | `Iterator` 구현 | **`IEnumerable<T>` + `yield return`** |
| Command | 인터페이스/람다 | **`Action`/`delegate`** |
| Singleton | static + 동기화 | **DI 컨테이너 lifetime=Singleton** (static보다 선호) |
| Factory | 팩토리 클래스 | 팩토리 또는 **DI** |

> 교훈: C#에선 "패턴을 클래스로 직접 짜기" 전에 **언어 기능(event/Func/yield/DI)으로 충분한지** 먼저 본다.

## 3. C# 개발 가이드 (자바 개발자용)

### 명명 컨벤션 (자바와 가장 다른 부분 — 주의)
[Microsoft 공식](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/identifier-names)

| 대상 | Java | **C#** |
|------|------|--------|
| 클래스/인터페이스/struct | PascalCase | **PascalCase** (인터페이스는 `I` 접두 — `IRepository`) |
| 메서드 | camelCase | **PascalCase** ← 자바와 다름! `GetUser()` |
| 프로퍼티 | (getter) | **PascalCase** `UserName` |
| 지역변수/매개변수 | camelCase | camelCase |
| private 필드 | camelCase | **`_camelCase`** (밑줄 접두) |
| 상수 | UPPER_CASE | **PascalCase** |

### 실무 관례 (idiomatic C#)
- **프로퍼티를 써라**: `getX()` 만들지 말고 `public int X { get; set; }`. 읽기전용은 `{ get; }`/`init`.
- **LINQ를 적극 활용**: 루프 대신 `.Where().Select().ToList()`.
- **async는 끝까지**: `await` 쓰면 호출 체인 전체를 `async Task`로 (블로킹 `.Result` 금지 — 데드락).
- **DI가 기본**: .NET에 내장 DI 컨테이너. `Program.cs`에서 `builder.Services.AddScoped<...>()`.
  → Singleton을 static으로 만들지 말고 DI lifetime으로.
- **record로 DTO**: 불변 데이터는 `record`.
- **`var`**: 우변에서 타입이 명백하면 `var` 사용 권장.
- **nullable 활용**: `string?`, `obj?.Prop`, `x ?? 기본값`.
- **프로젝트 구조**: 솔루션(`.sln`) > 프로젝트(`.csproj`) > 폴더. namespace는 폴더와 보통 일치시키되 명시.

### "이럴 땐 이렇게" (자바 습관 → C# 전환)
- 자바: `list.stream().filter(...).collect(...)` → C#: `list.Where(...).ToList()`
- 자바: `getName()` 호출 → C#: `Name` (프로퍼티)
- 자바: `interface Foo` + 익명클래스 콜백 → C#: `Action`/`Func` 델리게이트
- 자바: `Optional<User>` → C#: `User?` + null 연산자

## 관련 문서

- [언어 불문 공통](language-agnostic-fundamentals.md)
- [단순함 원칙(YAGNI)](../conventions/simplicity-principles.md) — 패턴 남발 말고 필요할 때
- [Findability — 명명·구조](../conventions/findability-driven-design.md)
