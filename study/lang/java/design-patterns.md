# 자바 개발자를 위한 디자인 패턴 — 팩토리 말고 나머지도

> 관점: GoF 23개를 다 외우지 말고, **자바 표준 라이브러리·스프링에 이미 박혀 있는** 것부터 "언제 쓰나 + 어디에 있나"로 잡는다. (Factory는 아는 상태에서 확장)
> 관련: [concept.md](concept.md) · [../../ai-ml/for-java-devs.md](../../ai-ml/for-java-devs.md) · 리스너=옵서버 (→ [../../cs/gc-gotchas.md](../../cs/gc-gotchas.md)).

---

## 0. 큰 그림 — 세 분류

디자인 패턴 = "자주 나오는 문제의 검증된 해법 틀." 세 가지로 갈린다:

| 분류 | 질문 | 대표 |
|------|------|------|
| **생성(Creational)** | 객체를 **어떻게 만드나** | Factory, Builder, Singleton |
| **구조(Structural)** | 객체를 **어떻게 조립·연결하나** | Decorator, Adapter, Proxy, Facade |
| **행위(Behavioral)** | 객체가 **어떻게 협력·소통하나** | Observer, Strategy, Template Method |

> 자바 렌즈: 대부분 **JDK·스프링에서 이미 쓰고 있다.** 이름만 몰랐을 뿐.

---

## 1. 생성 패턴 (Creational)

| 패턴 | 한 줄 의도 | JDK/스프링 예 |
|------|-----------|--------------|
| **Factory Method** | 무엇을 만들지 **하위/메서드가 결정** | `Calendar.getInstance()`, `List.of()` |
| **Abstract Factory** | **관련 객체 묶음**을 함께 생성 | `DocumentBuilderFactory` |
| **Builder** | 복잡한 객체를 **단계적으로** 조립 | `StringBuilder`, `Stream.builder()`, Lombok `@Builder` |
| **Singleton** | 인스턴스 **딱 하나** | **스프링 Bean 기본 스코프**, `enum` 싱글턴 |
| **Prototype** | **복제**로 생성 | `Object.clone()` |

- **Builder**가 특히 유용: 생성자 인자가 많고 선택적일 때. `new Person.Builder().name("김").age(30).build()`.
- **Singleton**은 `enum`으로 만드는 게 안전(직렬화·리플렉션 방어). 스프링 쓰면 Bean이 이미 싱글턴.

---

## 2. 구조 패턴 (Structural)

| 패턴 | 한 줄 의도 | JDK/스프링 예 |
|------|-----------|--------------|
| **Decorator** | 원본을 **감싸 기능 덧붙임**(상속 대신 조립) | `new BufferedReader(new FileReader(f))`, `Collections.unmodifiableList()` |
| **Adapter** | 인터페이스 **변환**(끼워 맞춤) | `Arrays.asList()`, `InputStreamReader` |
| **Proxy** | **대리자**(접근 제어·지연·원격) | **스프링 AOP**, JDK 동적 프록시, Hibernate 지연 로딩 |
| **Facade** | 복잡한 서브시스템에 **단순 창구** | `javax.faces`, 서비스 계층 |
| **Composite** | **트리**를 개별·전체 동일 취급 | Swing 컴포넌트, `java.io.File` |
| **Flyweight** | **공유**로 메모리 절약 | `Integer.valueOf()` 캐시(-128~127) |

- **Decorator = IO 스트림** 그 자체. `new BufferedReader(new FileReader(...))`가 데코레이터 중첩. (자바 렌즈에서 "람다 패치"랑 결이 같음)
- **Proxy = 스프링 AOP**. `@Transactional`이 붙으면 스프링이 **프록시로 감싸** 트랜잭션을 열고 닫는다. (→ [../../ai-ml/for-java-devs.md](../../ai-ml/for-java-devs.md)의 LoRA=AOP 비유)

---

## 3. 행위 패턴 (Behavioral)

| 패턴 | 한 줄 의도 | JDK/스프링 예 |
|------|-----------|--------------|
| **Observer** | 이벤트 나면 **구독자에게 알림** | **리스너**(`addActionListener`), `PropertyChangeListener`, 스프링 `@EventListener` |
| **Strategy** | 알고리즘을 **갈아끼움** | `Comparator`, 람다로 넘기는 전략 |
| **Template Method** | 뼈대는 고정, **일부만 하위클래스** | `AbstractList`, `HttpServlet`(service→doGet) |
| **Iterator** | 순회를 **추상화** | `Iterator`, for-each |
| **Command** | 요청을 **객체로** 포장 | `Runnable`, `Callable` |
| **Chain of Responsibility** | 처리기를 **사슬**로 넘김 | 서블릿 `Filter`, 스프링 시큐리티 필터 |
| **State** | **상태별로 행동** 바뀜 | 상태 머신 |

- **Observer = 리스너** 바로 그것. 등록·해제·누수 주의는 [../../cs/gc-gotchas.md](../../cs/gc-gotchas.md) 참고.
- **Strategy = 람다**. `list.sort(Comparator.comparing(...))`에서 정렬 "전략"을 람다로 주입. 자바 8 이후 전략 패턴은 대부분 람다로 대체.
- **Template Method**: `HttpServlet`을 상속해 `doGet()`만 채우는 게 딱 이 패턴. 뼈대(요청 분기)는 부모가, 세부만 내가.

---

## 자바 렌즈 — 한눈 매핑 (핵심만)

| 패턴 | "이미 쓰고 있던" 자바 |
|------|----------------------|
| Builder | `StringBuilder` |
| Singleton | 스프링 Bean |
| Decorator | `BufferedReader(new FileReader())` |
| Proxy | `@Transactional`(스프링 AOP) |
| Observer | `addXxxListener`(리스너) |
| Strategy | `Comparator`·람다 |
| Template Method | `HttpServlet.doGet()` |
| Iterator | for-each |

---

## 언제 뭘 쓰나 · 주의

- **먼저 문제를 만나고 패턴을 붙여라.** 패턴부터 깔면 **과설계(over-engineering)** — YAGNI 위반(→ [concept.md](concept.md) 7장 과한 추상화).
- 자바 8 이후 **Strategy·Command·Observer는 람다/메서드 참조로** 훨씬 짧게 쓴다. 굳이 클래스 안 만들어도 됨.
- 스프링을 쓰면 **Singleton·Proxy·Factory·Template**은 프레임워크가 이미 해준다 — **직접 구현할 일이 준다.**

---

## 한 줄 요약

디자인 패턴은 **3분류**(생성·구조·행위)로 잡고, **JDK·스프링에 이미 박힌 예**로 외우면 빠르다: **Builder=`StringBuilder`, Singleton=Bean, Decorator=IO 스트림, Proxy=`@Transactional`, Observer=리스너, Strategy=`Comparator`/람다, Template=`doGet`.** Factory만 알던 데서, "이미 쓰고 있던 것"에 이름을 붙이면 나머지가 한 번에 잡힌다.

## 참조
- Gamma et al., *Design Patterns (GoF)* — 원전
- [Refactoring.Guru — Design Patterns](https://refactoring.guru/design-patterns) (그림 설명 좋음)
