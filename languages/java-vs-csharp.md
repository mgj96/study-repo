# Java ↔ C# ↔ Python — 툴팁식 비교 + 개발 가이드

> "자바에선 이렇게 하는데 C#/파이썬에선?" 을 **개념 → Java → C# → Python** 로 빠르게 찾는 참조.
> 디자인 패턴·설계는 그대로 옮겨가고([공통](language-agnostic-fundamentals.md)), 여기선 **관용구 차이**만.
> NotebookLM에 넣고 "C#에서 X는 어떻게?" 물으면 툴팁처럼 답이 나온다.

## 1. 언어 기능 대조 (개념 → Java → C#)

| 개념 | Java | C# | Python |
|------|------|-----|--------|
| 프로퍼티 | `getX()/setX()` | `public int X { get; set; }` | **`@property` 데코레이터** |
| 컬렉션 질의 | Stream + 람다 | LINQ `.Where().Select()` | **리스트 컴프리헨션** `[f(x) for x in xs if ...]` |
| 비동기 | `CompletableFuture` | `async/await` | **`async/await`** (asyncio) |
| 콜백/이벤트 | 함수형 인터페이스 | `delegate`/`event`,`Func<>` | **함수가 일급 객체** (그냥 함수 전달) |
| 값 타입 | (없음) | `struct` = 값 타입 | (없음) 전부 객체 참조 |
| 타입 | 정적 | 정적 | **동적**(런타임), 선택적 타입힌트(`typing`) |
| null | `Optional<T>` | `T?`,`??`,`?.` | **`None`** (`?.` 없음, `x or 기본값`) |
| 불변 DTO | record | `record` | **`@dataclass(frozen=True)`** / `namedtuple` |
| 인터페이스 | `interface` | `interface`(`I`접두) | **ABC / `Protocol`**(덕 타이핑) |
| 패키지 | `package` | `namespace` | **모듈/패키지**(폴더+`__init__.py`) |
| 진입점 | `static void main` | `Main`/top-level | `if __name__ == "__main__":` |

## 2. 디자인 패턴 — 같은 패턴, C#은 언어 기능으로 더 짧게

당신의 패턴 지식은 그대로 쓰되, C#은 종종 **언어 기능이 패턴을 대신**한다:

| 패턴 | Java 관용 | C# 관용 | Python 관용 |
|------|----------|---------|------------|
| Observer | 인터페이스+리스너 | `event`/`delegate` | 콜러블(함수) 리스트 |
| Strategy | 인터페이스 주입 | `Func<>`/인터페이스 | **함수 전달**(일급 객체) |
| Iterator | `Iterator` 구현 | `IEnumerable`+`yield` | **제너레이터 `yield`** |
| Command | 인터페이스/람다 | `Action`/delegate | 콜러블 |
| Singleton | static+동기화 | DI 컨테이너 | **모듈 자체가 싱글톤** |
| Factory | 팩토리 클래스 | 팩토리/DI | 팩토리 함수 |

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

## 4. Python 개발 가이드 (자바/C# 개발자용)

### 명명 컨벤션 ([PEP 8](https://peps.python.org/pep-0008/))
| 대상 | Java | C# | **Python** |
|------|------|-----|-----------|
| 클래스 | PascalCase | PascalCase | **PascalCase** |
| 메서드/함수 | camelCase | PascalCase | **snake_case** `get_user()` |
| 변수 | camelCase | camelCase | **snake_case** |
| 상수 | UPPER_CASE | PascalCase | **UPPER_CASE** |
| "private" | camelCase | `_camelCase` | **`_leading_underscore`**(관례, 강제 아님) |

### 관용 (idiomatic Python)
- **getter/setter 대신** `@property` 데코레이터. 평소엔 그냥 public 속성 직접 접근(캡슐화 강박 X).
- **루프 대신 컴프리헨션**: `[x*2 for x in nums if x>0]` (LINQ/Stream 대응).
- **덕 타이핑**: 인터페이스 명시보다 "그 메서드가 있으면 된다". 명시가 필요하면 `Protocol`/`ABC`.
- **타입은 선택**: `def f(x: int) -> str:` 힌트는 문서·IDE용, 런타임 강제 아님(mypy로 검사).
- **DTO는 `@dataclass`**: 불변은 `@dataclass(frozen=True)`.
- **None 처리**: `?.` 없음 → `x if x else 기본값`, `x or 기본값`, `getattr(obj, 'a', None)`.
- **함수가 일급**: 콜백·전략은 그냥 함수를 넘긴다(델리게이트 불필요).
- **가상환경·패키지**: `venv` + `pip`/`poetry`, `requirements.txt`/`pyproject.toml`.

### "이럴 땐 이렇게" (Java/C# 습관 → Python)
- 자바 `list.stream().filter().collect()` / C# `.Where().ToList()` → 파이썬 `[..for..if..]`
- `getName()` → 속성 직접 `obj.name` (또는 `@property`)
- 인터페이스+구현 주입 → **그냥 함수 전달** 또는 `Protocol`
- `Optional`/`T?` → `None` + `or`/조건식

## 관련 문서

- [언어 불문 공통](language-agnostic-fundamentals.md)
- [단순함 원칙(YAGNI)](../conventions/simplicity-principles.md) — 패턴 남발 말고 필요할 때
- [Findability — 명명·구조](../conventions/findability-driven-design.md)
