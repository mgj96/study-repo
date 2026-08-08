# 딥다이브 — 테스트 전략: 통과하는 테스트가 아무것도 증명하지 않을 때

> 기반: **Cohn, *Succeeding with Agile* (2009, 테스트 피라미드)** · **Dodds, *The Testing Trophy* (2018~)** · **Meszaros, *xUnit Test Patterns* (2007, 테스트 더블)** · **Fowler, *Mocks Aren't Stubs* (2004)**
> 형식: 30초 직관 → 역사(두 도형의 대립) → 원리 → 트레이드오프.
> 관련: `@Transactional`의 프록시 동작은 [deep-spring-transaction.md](deep-spring-transaction.md), 학습 순서는 [../../backend-roadmap.md](../../backend-roadmap.md).

---

## 0. 30초 직관 — 전부 초록불인데 배포하면 터진다

```java
@Test
void 출차_요금_계산() {
    when(feePolicy.calculate(any())).thenReturn(5000);   // mock
    when(repository.findById(42L)).thenReturn(parking);  // mock

    exitService.exit(42L);

    verify(feePolicy).calculate(any());                  // "호출했는지" 확인
    verify(repository).save(any());
}
```

이 테스트는 **항상 통과한다.** 요금 정책이 틀려도, 쿼리가 틀려도, 트랜잭션이 안 걸려도. 왜냐하면 —

> **모든 협력자를 mock으로 바꾼 테스트는 "내 코드가 내 상상대로 호출한다"만 검증한다.**
> 상상 자체가 틀렸는지는 영원히 모른다. **테스트가 구현의 복사본**이 된 것이다.

이 노트의 질문: **무엇을 어느 비율로, 진짜와 가짜 중 무엇으로 테스트할 것인가.** 답이 하나가 아니라서 15년째 논쟁 중이고, 그 논쟁의 지형을 아는 것이 곧 전략이다.

---

## 1. 역사 — 피라미드와 트로피, 두 도형의 대립

### 1-1. 테스트 피라미드 (Mike Cohn, 2009)

```
        /  E2E  \        느리고 · 깨지기 쉽고 · 비싸다 → 조금만
       / 통합    \
      / 단위      \      빠르고 · 안정적이고 · 싸다 → 많이
```

*Succeeding with Agile*(2009)에서 나온 원칙: **아래(단위)를 두껍게, 위(E2E)를 얇게.** 근거는 당시의 비용 구조다 — 2009년의 "통합 테스트"는 느린 실제 서버·수동 환경을 의미했고, 단위 테스트만이 빨랐다.

### 1-2. 테스팅 트로피 (Kent C. Dodds, 2018~)

> "Write tests. Not too many. **Mostly integration.**" — Guillermo Rauch를 인용하며 Dodds가 정식화

```
       🏆
      /E2E \
     /━━━━━━\
    /  통합   \      ← 제일 두껍게
    \  단위   /
     \정적분석/
```

**통합을 제일 두껍게** 하라는, 피라미드를 뒤집는 주장. 근거는 **비용 구조가 바뀌었다**는 것이다:

- Testcontainers·인메모리 서버·`@SpringBootTest` 슬라이스 — **통합 테스트가 싸고 빨라졌다**
- 반면 mock 범벅 단위 테스트는 **"통과하지만 아무것도 증명 못 하는"**(0장) 비용을 치른다는 게 드러났다

> **누가 맞나?** — 질문이 틀렸다. 두 도형은 **"신뢰(진짜에 가까움) vs 속도(피드백 주기)"의 거래에서 어디에 서느냐**다.
> 도메인 로직이 두꺼우면(요금 계산 엔진) 순수 단위 테스트가 값지고, 로직이 얇고 연결이 본체인 CRUD 서비스면 통합이 값지다.
> **"Integration-First"를 택했다면 그건 트로피 진영의 선택이고, 그 근거를 말할 수 있어야 한다** — "우리 코드의 버그는 대부분 계층 사이(쿼리·매핑·트랜잭션 경계)에서 나기 때문"이 그 답이다.

---

## 2. 테스트 더블 5종 — "mock"이라 부르는 것들의 정체

Meszaros(*xUnit Test Patterns*, 2007)가 정리한 분류. 실무에서 전부 "mock"이라 뭉뚱그리지만 **검증 방식이 다르다**:

| 종류 | 무엇 | 예 |
|---|---|---|
| **Dummy** | 자리만 채움, 사용 안 됨 | 시그니처 때문에 넘기는 `null` |
| **Stub** | **정해진 답만 반환** | `when(...).thenReturn(5000)` |
| **Spy** | 실제 동작 + **호출 기록** | 발송된 메일을 저장해두는 가짜 메일러 |
| **Mock** | **"어떻게 호출될지"를 미리 기대하고 검증** | `verify(feePolicy).calculate(...)` |
| **Fake** | **진짜로 동작하는 간이 구현** | 인메모리 Map으로 만든 Repository |

핵심 구분은 **상태 검증 vs 행위 검증**이다(Fowler, *Mocks Aren't Stubs*, 2004):

- **Stub/Fake → 상태 검증**: "실행 후 결과가 5000원인가" — **무엇이 나왔나**를 본다
- **Mock → 행위 검증**: "calculate가 1회 호출됐나" — **어떻게 했나**를 본다

> Fowler는 이 글에서 두 학파를 명명했다 — 가능한 한 진짜 객체를 쓰는 **고전파(classicist)** 와, 협력자를 mock으로 격리하는 **mockist**. 트로피 vs 피라미드 논쟁의 원형이 이미 2004년에 있었던 셈이다.

---

## 3. Mock 과용의 비용 — 리팩터링을 막는 테스트

행위 검증(mock)은 필연적으로 **구현 세부에 결합**된다:

```java
verify(repository).findById(42L);       // "findById를 호출할 것"이라는 구현 명세
```

이제 성능 개선으로 `findById` 대신 `findWithFeePolicy`(fetch join)로 바꾸면 — **동작은 그대로인데 테스트가 깨진다.** 반대로 요금 계산 로직이 틀려도 호출 순서만 맞으면 — **동작이 틀렸는데 테스트는 통과한다.**

> **테스트의 존재 이유가 "안심하고 바꾸기 위해서"인데, mock 결합 테스트는 정확히 그걸 방해한다.**
> 리팩터링할 때마다 테스트를 고치고 있다면, 테스트가 동작이 아니라 **구현을 스냅샷** 찍고 있다는 신호다.

**mock이 정당한 자리** — 전부 "진짜를 쓸 수 없는 경계"다:

- 외부 결제사 API처럼 **테스트에서 실제 호출이 불가능/위험**한 것
- 메일·SMS처럼 **부수효과가 바깥으로 나가는** 것
- 오늘 날짜·난수처럼 **비결정적**인 것 (이건 mock보다 주입이 낫다 — `Clock`을 파라미터로)

**나머지는 Fake가 대개 낫다.** 인메모리 Repository는 상태 검증이 가능하고, 구현이 바뀌어도 테스트가 안 깨진다.

---

## 4. `@Transactional` 롤백 테스트의 함정

스프링 통합 테스트의 표준 관행 — 테스트에 `@Transactional`을 붙이면 끝나고 **자동 롤백**되어 DB가 깨끗해진다. 편리하지만, **실제와 다른 경로**를 탄다는 대가가 있다:

| 못 잡는 버그 | 왜 |
|---|---|
| **커밋 시점 오류** | 지연 제약(deferred constraint)·트리거·플러시 순서 문제는 **커밋할 때** 터지는데, 커밋을 안 하니 영영 안 터짐 |
| **JPA 플러시 누락** | 롤백 전 자동 플러시가 안 일어나 쿼리 자체가 안 나갔는데 통과할 수 있음 (`flush()` 강제 필요) |
| **`REQUIRES_NEW` 상호작용** | 테스트 트랜잭션과 별개 트랜잭션이 얽혀 실제와 다른 커밋/롤백 조합이 됨 |
| **트랜잭션 밖 동작** | 프로덕션에선 트랜잭션이 끝난 뒤 도는 코드(이벤트 리스너 `AFTER_COMMIT` 등)가 테스트에선 **아예 실행 안 됨** |

> 특히 마지막 줄 — [Outbox 패턴](../../cs/deep-distributed-consistency.md)의 릴레이나 `@TransactionalEventListener(AFTER_COMMIT)`는 **롤백 테스트에서 침묵**한다. "테스트는 통과하는데 이벤트가 안 나간다"의 정체다.

**대안**: 핵심 흐름 일부는 **진짜 커밋 + 명시적 정리**(`@Sql` cleanup, Testcontainers로 매번 새 DB)로 검증한다. 전부 그럴 필요는 없다 — **커밋 경로가 의심되는 곳만.**

---

## 5. 픽스처 — 테스트 데이터를 짓는 법

테스트가 늘수록 진짜 고통은 검증부가 아니라 **준비부(given)** 다.

**Object Mother** — 자주 쓰는 완성품을 공장 메서드로:

```java
Parking p = ParkingMother.exitedCar();   // "출차된 차" 표준 픽스처
```
간단하지만, 변형이 늘면 `exitedCarWithUnpaidFeeAndSeasonTicket()` 같은 **메서드 폭발**이 온다.

**Fixture Builder** — 기본값 + 필요한 것만 바꾸기:

```java
Parking p = aParking()                 // 모든 필드에 유효한 기본값
    .withStatus(EXITED)
    .withUnpaidFee(3000)               // 이 테스트에 중요한 것만 명시
    .build();
```

> **빌더의 진짜 가치는 "이 테스트에서 중요한 것"만 드러난다는 것.** 나머지 필드가 소음으로 안 보이니, 테스트가 **문서**로 읽힌다 — "미납 요금이 있는 출차 차량이면 ~해야 한다"가 코드에서 그대로 보인다.
> [design-patterns.md](design-patterns.md)의 Builder가 테스트에서 제일 값을 하는 자리가 여기다.

---

## 6. 3단 요약 (암기용)

### Q1. 단위 테스트와 통합 테스트, 비율을 어떻게 잡나?

- **① 결론 · WHAT** 고정 비율은 없다 — **버그가 어디서 나는 코드베이스인가**로 정한다. 도메인 로직이 두꺼우면 단위 중심(피라미드), 로직이 얇고 계층 연결이 본체면 통합 중심(트로피).
- **② 원리 · HOW** 피라미드(Cohn, 2009)는 "통합이 느리고 비싸던" 시대의 비용 구조를 반영한 것이고, 트로피(Dodds)는 Testcontainers·슬라이스 테스트로 **통합이 싸진 뒤**의 재계산이다. CRUD·연동 중심 시스템의 버그는 대부분 쿼리·매핑·트랜잭션 경계, 즉 **계층 사이**에서 나므로 mock 단위 테스트가 그걸 못 잡는다.
- **③ 확장 · TRADE-OFF** 통합 중심의 대가는 **피드백 속도와 실패 원인의 모호함**(어느 층이 깨졌는지 바로 안 보임)이다. 그래서 순수 로직(요금 계산 등)은 여전히 빠른 단위 테스트로 분리해 두는 게 남는 장사다 — 헥사고날의 "도메인 격리"([../../architecture/concept.md](../../architecture/concept.md))가 정확히 이걸 가능하게 하는 구조다.

### Q2. Mockito를 언제 쓰고 언제 쓰지 말아야 하나?

- **① 결론 · WHAT** **진짜를 쓸 수 없는 경계**(외부 API·메일 발송·시간/난수)에만. 내 시스템 내부 협력자는 **Fake(인메모리 구현)나 진짜**가 낫다.
- **② 원리 · HOW** mock의 `verify`는 행위 검증이라 **구현 세부에 결합**된다 — 동작이 같아도 호출 방식이 바뀌면 깨지고(거짓 빨강), 동작이 틀려도 호출만 맞으면 통과한다(거짓 초록). 테스트가 구현의 복사본이 되어 **리팩터링을 벌주는** 구조다. Stub/Fake의 상태 검증은 "결과가 맞는가"만 보므로 구현 변경에 강하다.
- **③ 확장 · TRADE-OFF** Fake의 대가는 **Fake 자체의 유지보수**와 "Fake가 진짜와 다르게 동작할" 리스크다 — 그래서 Fake와 실물이 같은 계약 테스트(contract test)를 공유하게 하는 게 정석이다. 용어 정리도 무기가 된다: Dummy/Stub/Spy/Mock/Fake(Meszaros)를 구분해 말하면 "mock을 줄이자"는 논의가 정확해진다.

### Q3. 테스트에 `@Transactional` 붙여 자동 롤백하는 건 안전한가?

- **① 결론 · WHAT** 편리하지만 **실제 커밋 경로를 타지 않는다**는 걸 알고 써야 한다. 커밋 시점 제약 위반, 플러시 누락, `AFTER_COMMIT` 리스너 미실행은 **롤백 테스트가 구조적으로 못 잡는다.**
- **② 원리 · HOW** 테스트 트랜잭션이 모든 걸 감싸고 마지막에 롤백하므로, 커밋할 때만 일어나는 일(지연 제약 검사, 커밋 후 이벤트, Outbox 릴레이)은 아예 실행되지 않는다. `REQUIRES_NEW`가 섞이면 프로덕션과 다른 트랜잭션 조합이 된다.
- **③ 확장 · TRADE-OFF** 전부 진짜 커밋으로 돌리면 격리·정리 비용(느림, 테스트 간 오염)이 커진다. 현실 균형: **대부분은 롤백 테스트로 빠르게, 커밋 경로가 의심되는 핵심 흐름만 Testcontainers + 진짜 커밋 + 명시적 정리**로. 자동 롤백 인프라를 직접 구축했다면, "그 인프라가 못 잡는 버그 목록"까지 말할 수 있어야 설계를 완성한 것이다.

---

## 용어 사전

| 용어 | 뜻 |
|------|-----|
| 테스트 피라미드 | 단위 두껍게, E2E 얇게 (Cohn 2009) |
| 테스팅 트로피 | 통합을 가장 두껍게 (Dodds) |
| 테스트 더블 | 진짜 대신 쓰는 대역 총칭 (Dummy·Stub·Spy·Mock·Fake) |
| 상태 검증 / 행위 검증 | 결과 값을 확인 / 호출 방식을 확인 |
| 고전파 / mockist | 진짜 객체 선호 / 협력자 격리 선호 (Fowler 2004) |
| 거짓 초록/빨강 | 버그인데 통과 / 정상인데 실패 |
| Fake | 진짜로 동작하는 간이 구현 (인메모리 Repository) |
| 계약 테스트 | Fake와 실물이 같은 스펙을 통과하는지 공유 검증 |
| Testcontainers | 테스트마다 진짜 DB를 도커로 띄우는 라이브러리 |
| Object Mother / Fixture Builder | 완성품 공장 / 기본값+변경점 빌더 |
| 자동 롤백 | 테스트 트랜잭션을 끝에 롤백해 DB를 되돌리는 관행 |

## 연결 지도
- **`@Transactional`의 프록시·전파 (함정의 뿌리)**: → [deep-spring-transaction.md](deep-spring-transaction.md)
- **AFTER_COMMIT과 Outbox (롤백 테스트의 사각지대)**: → [../../cs/deep-distributed-consistency.md](../../cs/deep-distributed-consistency.md)
- **Builder 패턴**: → [design-patterns.md](design-patterns.md)
- **도메인 격리가 단위 테스트를 가능케 함**: → [../../architecture/concept.md](../../architecture/concept.md) 2-2장
- **학습 순서**: → [../../backend-roadmap.md](../../backend-roadmap.md)

## 출처
- Cohn, M. *Succeeding with Agile.* Addison-Wesley, 2009 — 테스트 피라미드
- Dodds, K. C. *The Testing Trophy and Testing Classifications* — https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
- Meszaros, G. *xUnit Test Patterns: Refactoring Test Code.* Addison-Wesley, 2007 — 테스트 더블 분류
- Fowler, M. *Mocks Aren't Stubs.* 2004 — https://martinfowler.com/articles/mocksArentStubs.html
- Spring Framework Reference, *Testing / Transaction Management* — 자동 롤백의 공식 동작

_짧은 인용은 출처 표기. 프레임워크 버전에 따라 테스트 동작 세부는 달라질 수 있다._
