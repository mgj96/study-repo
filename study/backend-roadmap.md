# 백엔드 심화 로드맵 — 실무 역량 기반 갭 분석

> **어떻게 만들었나**: 실제 5년치 실무 이력(풀스택·B2G 분산 주차관제 플랫폼)에서 쓴 기술을,
> 이 저장소가 **이미 다루는 노트**와 대조해 **비어 있는 것만** 뽑았다.
> 기존 [roadmap.md](roadmap.md)는 관심사(ML·그래픽스) 기반이고, 이 문서는 **직무 역량** 기반이다. 둘은 병행한다.
>
> ⚠️ 이 문서에는 개인정보(연락처·소속·발주처)를 넣지 않는다. **기술 상황과 학습 항목만** 남긴다.

---

## 0. 한눈에 — 커버리지 지도

| 실무에서 쓰는 것 | 저장소 현황 | 판정 |
|---|---|---|
| JVM 내부 동시성 (volatile·CAS·락) | [cs/deep-jmm.md](cs/deep-jmm.md) 깊게 | ✅ |
| 인덱스·실행계획 | [cs/deep-btree-index.md](cs/deep-btree-index.md) 깊게 | ✅ |
| GC·메모리 누수 | [cs/gc-gotchas.md](cs/gc-gotchas.md), [unity/deep-gc.md](unity/deep-gc.md) | ✅ |
| 디자인 패턴 (Factory·Template·Proxy) | [lang/java/design-patterns.md](lang/java/design-patterns.md) | ✅ |
| REST·gRPC·Protobuf 형식/방식 | [cs/web-communication.md](cs/web-communication.md) | ✅ |
| 격리수준·낙관/비관 락·N+1 | [cs/deep-transaction-and-lock.md](cs/deep-transaction-and-lock.md) | ✅ |
| **Spring 프레임워크 자체** | [lang/java/deep-spring-transaction.md](lang/java/deep-spring-transaction.md) | ✅ |
| **분산 정합성 (멱등성·Outbox·Saga)** | [cs/deep-distributed-consistency.md](cs/deep-distributed-consistency.md) | ✅ |
| **Redis·캐시 전략·분산 락** | [cs/deep-redis-cache-and-lock.md](cs/deep-redis-cache-and-lock.md) | ✅ |
| **성능 공학 (부하 테스트 해석)** | [cs/deep-performance-engineering.md](cs/deep-performance-engineering.md) | ✅ |
| **테스트 전략** | [lang/java/deep-testing-strategy.md](lang/java/deep-testing-strategy.md) | ✅ |
| **헥사고날 아키텍처** | 없음 | ❌ |

> **정리**: 그동안 **CS 근간(OS·메모리·자료구조)** 과 **관심 분야(ML·그래픽스)** 를 우선 팠다.
> 그 결과 **실무 프레임워크 층(Spring·분산·캐시·성능·테스트)** 은 아직 노트가 없다.
> 이 문서는 그 층을 채우는 순서를 정한 것이다.

---

## 1. 티어 1 — 가장 급한 3개

실무에서 **매일 쓰는데 이론 노트가 없는** 항목. 손에 익은 것과 설명할 수 있는 것 사이의 간격이 가장 큰 곳이다.

### 1-1. 분산 정합성 — 멱등성 · Outbox · Saga

**실무 맥락**: 중앙 서버 · 온프렘 게이트웨이 · 요금엔진으로 나뉜 환경에서 **결제 이중과금**을 근본원인 분석으로 차단.
외부 벤더 연계에 **재전송·멱등성·타임아웃** 기반 결함 내성 설계.

**배울 것**
- 왜 분산에서 **exactly-once가 원리적으로 불가능**한가 → at-least-once + 멱등성이 현실 해법인 이유
- 멱등키(idempotency key) 설계: 키를 무엇으로 잡나, 저장 기간, 동시 요청 충돌 처리
- **Outbox 패턴**: DB 트랜잭션과 메시지 발행의 원자성을 어떻게 확보하나 (dual write 문제)
- **2PC vs Saga**: 왜 현대 시스템이 2PC를 피하나, 보상 트랜잭션(compensating transaction)
- 전진 복구(roll-forward) vs 롤백 — 결제처럼 되돌릴 수 없는 작업
- CAP·PACELC, 결과적 일관성

**꼬리질문 예상**
- "이중과금의 근본 원인이 정확히 뭐였나? 재시도인가, 경쟁 상태인가?"
- "멱등키를 어디에 저장했나? 그 저장소가 죽으면?"
- "Outbox를 썼다면 릴레이가 두 번 읽으면 어떻게 되나?"

**✅ 작성 완료** → [cs/deep-distributed-consistency.md](cs/deep-distributed-consistency.md)

---

### 1-2. Spring 트랜잭션 — `@Transactional`의 실제 동작

**실무 맥락**: `@Transactional(readOnly)` 전략 설계, 생성자 주입 전환, 관심사 분리.

**배울 것**
- **프록시 기반 AOP**라서 생기는 함정: **self-invocation**(같은 클래스 내부 호출 시 트랜잭션 미적용), `private` 메서드 무시
- 전파 속성(propagation): `REQUIRED` vs `REQUIRES_NEW` vs `NESTED` — 언제 갈리나
- `readOnly = true`가 실제로 하는 일 (플러시 모드 · DB 힌트 · 복제본 라우팅)
- 롤백 규칙: 왜 **체크 예외는 기본적으로 롤백 안 되나**
- 트랜잭션 경계와 락 보유 시간 — 긴 트랜잭션이 커넥션 풀을 말리는 경로
- 생성자 주입이 필드 주입보다 나은 진짜 이유 (불변성 · 순환참조 조기 발견 · 테스트 용이)

**꼬리질문 예상**
- "`@Transactional` 붙였는데 롤백이 안 됐다. 원인 후보 3개는?"
- "`readOnly=true`를 붙이면 성능이 왜 좋아지나?"
- "트랜잭션 안에서 외부 API를 호출하면 뭐가 문제인가?" ← **외부 벤더 연계와 직결**

**✅ 작성 완료** → [lang/java/deep-spring-transaction.md](lang/java/deep-spring-transaction.md)

---

### 1-3. Redis — 캐시 전략과 분산 락

**실무 맥락**: Redis 캐싱으로 반복 조회 구간 최적화, **복수 프로세스 환경의 선착순 정합성** 확보.

**배울 것**
- 캐시 전략 비교: **Cache-Aside**(가장 흔함) · Write-Through · Write-Behind · Read-Through
- **캐시 스탬피드(thundering herd)**: TTL이 동시에 만료될 때. 해법 — 지터·논리적 만료·뮤텍스
- 캐시 무효화가 어려운 이유, 캐시-DB 불일치 창(window)
- **분산 락**: `SETNX` + TTL의 함정(작업이 TTL보다 길면?), **Redlock 논쟁**(Kleppmann vs antirez)
- 왜 분산 락은 "정확성"이 아니라 "효율성"에만 써야 한다는 주장이 있나 → **펜싱 토큰(fencing token)**
- 단일 스레드 이벤트 루프인데 왜 빠른가, `KEYS` 같은 O(n) 명령이 위험한 이유

**연결**: JVM 내부 동시성은 [cs/deep-jmm.md](cs/deep-jmm.md)에 있다. **프로세스가 여러 개면 그 도구가 전부 무효**라는 게 이 항목의 출발점.

**꼬리질문 예상**
- "선착순을 Redis로 처리했는데, 락 획득 후 프로세스가 죽으면?"
- "`synchronized`로는 왜 안 되나?" ← 이 대비가 핵심
- "캐시와 DB가 어긋나는 순간이 있나?"

**✅ 작성 완료** → [cs/deep-redis-cache-and-lock.md](cs/deep-redis-cache-and-lock.md)

---

## 2. 티어 2 — 숫자를 말하려면 필요한 것

성능 개선이나 안정화 작업은 **숫자로 말하게 된다.** 그 숫자를 스스로 방어하려면 아래가 필요하다.

### 2-1. 성능 공학 — 부하 테스트를 읽는 법

**실무 맥락**: nGrinder 부하 테스트로 병목 식별, **API 응답 5초 → 1초**. 메모리 누수 분석으로 **재기동 월 3회 → 0회**.

**배울 것**
- **평균의 함정** — 왜 p95·p99를 봐야 하나. 평균 200ms인데 p99가 5초인 서비스
- **Little's Law** (`동시 사용자 = 처리량 × 응답시간`) — 부하 시나리오 설계의 근간
- 처리량(throughput) vs 지연(latency) vs 동시성 — 셋의 관계
- 병목 식별 방법론: **USE**(Utilization·Saturation·Errors), **RED**(Rate·Errors·Duration)
- 커넥션 풀 사이징이 왜 "크게 잡으면 좋다"가 아닌가
- 부하 테스트의 흔한 거짓말: 워밍업 없음 · 캐시 히트 100% · 단일 데이터

**꼬리질문 예상**
- "5초 → 1초는 평균인가 p99인가?"
- "병목이 DB인지 애플리케이션인지 어떻게 갈랐나?"
- "부하를 2배로 주면 응답시간이 어떻게 될 것 같나?"

**✅ 작성 완료** → [cs/deep-performance-engineering.md](cs/deep-performance-engineering.md)

---

### 2-2. 트랜잭션·락 심화 (기존 Q&A 승격)

**현황**: [cs/qna/database.md](cs/qna/database.md)에 격리수준·낙관/비관 락이 **3줄 Q&A로만** 있다. 실무 강도에 못 미친다.

**배울 것**
- 격리수준별 이상현상을 **실제 SQL 시나리오**로 재현 (Dirty·Non-repeatable·Phantom)
- MVCC가 어떻게 읽기 락 없이 일관성을 주나 — Oracle·PostgreSQL·MySQL의 구현 차이
- **갭 락(gap lock)** 과 데드락 — 인덱스 설계가 락 범위를 바꾼다 ([deep-btree-index.md](cs/deep-btree-index.md)와 연결)
- 낙관적 락의 재시도 전략, 버전 컬럼 설계
- 데드락 탐지 vs 예방, 락 순서 규약

**✅ 작성 완료** → [cs/deep-transaction-and-lock.md](cs/deep-transaction-and-lock.md)

---

### 2-3. 테스트 전략

**실무 맥락**: Integration-First TDD · Fixture Builder · 자동 롤백 인프라, GS 인증 대응.

**배울 것**
- **테스트 피라미드 vs 테스팅 트로피** — 왜 통합 테스트를 앞에 두는 선택이 나오나
- 테스트 더블 5종(Dummy·Stub·Spy·Mock·Fake)의 정확한 구분
- **Mockito 과용의 비용** — 구현에 결합된 테스트가 리팩터링을 막는 경로
- `@Transactional` 롤백 테스트의 함정 (실제 커밋 경로를 안 타므로 못 잡는 버그)
- Fixture Builder / Object Mother 패턴
- 테스트가 문서가 되는 지점 — 테스트 코드 기반 API 명세 자동화

**✅ 작성 완료** → [lang/java/deep-testing-strategy.md](lang/java/deep-testing-strategy.md)

---

## 3. 티어 3 — 설계 언어

### 3-0. ✅ 아키텍처 설계 (신규) — [architecture/concept.md](architecture/concept.md)

설계서 작성법(품질 속성 시나리오·ADR·C4) · 스타일 카탈로그(레이어드~MSA·CQRS) · 경계 긋기(콘웨이·기준 4개·ArchUnit). 3-1 헥사고날은 이 문서의 2-2장에 포함됨.

### 3-1. 헥사고날 아키텍처 (포트/어댑터)

**실무 맥락**: 산재된 출차·정산 제어 로직을 **단일 진입점으로 통합** (헥사고날·파사드).

**배울 것**
- 의존성 역전이 실제로 뒤집는 것 — 도메인이 인프라를 모르게 하는 구조
- 포트(인터페이스) vs 어댑터(구현) 경계를 어디에 긋나
- 레이어드 · 헥사고날 · 클린 아키텍처의 실제 차이 (대부분 같은 말의 다른 포장)
- **비용**: 파일 수 폭증, 매핑 코드. 언제 과한가
- 파사드와의 관계 — 파사드는 복잡도를 숨기고, 포트는 방향을 뒤집는다

**연결**: GoF 패턴은 [lang/java/design-patterns.md](lang/java/design-patterns.md)에 있다. 이건 **한 단계 위 층**.

**목표 산출물**: `lang/java/deep-hexagonal.md`

---

### 3-2. 실시간 통신 방식 선택

**실무 맥락**: WebSocket 오남용으로 인한 **서버 메모리 부하** → 실시간성이 낮은 페이지를 **Polling으로 전환**. gRPC 다중게이트 제어, SSE 이벤트 라우팅.

**배울 것**
- Polling · Long Polling · SSE · WebSocket · gRPC 스트리밍의 **연결당 비용**
- 왜 WebSocket이 메모리를 먹나 — 연결당 상태 유지, 스케일아웃 시 세션 어피니티
- SSE가 저평가된 이유와 적합한 곳 (단방향·자동 재연결·HTTP 인프라 그대로)
- 로드밸런서·프록시 뒤에서 각각이 겪는 문제

**현황**: [cs/web-communication.md](cs/web-communication.md)가 **형식·방식**은 다루지만 **운영 비용 관점**이 빠져 있다. 그 축을 추가.

**✅ 작성 완료** → [cs/web-communication.md](cs/web-communication.md) 5장 (연결당 비용·스케일아웃·프록시 함정·결정 표)

---

## 4. 학습 순서 제안

```
1-2 Spring 트랜잭션      ← 매일 쓰는 것부터. 가장 빨리 체감된다
   ↓
2-2 트랜잭션·락 심화     ← 1-2의 밑바닥. 인덱스 노트와 이어짐
   ↓
1-3 Redis 캐시·분산 락   ← "프로세스가 여러 개면?"으로 자연스럽게 확장
   ↓
1-1 분산 정합성          ← 위 셋이 있어야 이해가 선다. 가장 어렵고 가장 값어치 있다
   ↓
2-1 성능 공학            ← 숫자를 방어하려면
   ↓
2-3 테스트 · 3-1 헥사고날 · 3-2 실시간 통신
```

> **왜 이 순서인가**: 분산 정합성(1-1)이 제일 중요하지만 **제일 먼저 하면 안 된다.**
> 단일 노드 트랜잭션과 락을 모르면 "분산에서 왜 그게 깨지는지"가 안 잡힌다.
> 익숙한 것 → 그 가정이 무너지는 지점 → 새 도구 순서로 간다.

---

## 5. 병행 과제 — 내 코드를 설명할 수 있게 만들기

[interview/explain-your-code.md](interview/explain-your-code.md)는 지금 **빈 프레임워크**다.
직접 만든 기능마다 WHAT / HOW / TRADE-OFF 3단을 채워두면, 개념 학습과 별개로 **설명 능력**이 쌓인다.

특히 **성능 개선처럼 숫자가 붙는 작업**은 아래를 스스로 물어봐야 한다:

- 그 숫자는 **평균인가 p99인가** (→ 2-1 성능 공학)
- 병목이 DB인지 애플리케이션인지 **어떻게 갈랐나**
- 개선의 대가로 **무엇을 포기했나** (메모리? 복잡도? 정합성?)

> 이미 한 일을 정리하는 작업이라 **새로 배울 게 없다.** 기억이 흐려지기 전에 적어두는 것만으로 완성되므로,
> 새 개념 학습보다 투자 대비 효과가 클 수 있다.

---

## 6. 언어 전략 — 5~7년차 이직 관점 (2026-08 결정)

"Java 다음 언어"를 고를 때, **이직용과 학습용을 분리**한다. 하나의 언어가 두 역할을 다 하려다 둘 다 놓치는 게 흔한 실수다.

| 트랙 | 언어 | 판단 | 근거 |
|---|---|---|---|
| **이직 무기** | **Kotlin** | ⭕ 1~2주 투자 가치 | 지원 대상 회사들(토스 계열·핀테크)의 JD가 Java/Kotlin 병기. **같은 JVM·같은 Spring**이라 전환 비용이 극히 낮고, 면접에서 "코틀린 가능"이 즉시 가점 |
| 이직 무기 | Rust | ❌ 이번 사이클엔 아님 | 서울 5~7년차 백엔드 채용에서 Rust 요구는 극소수(블록체인·인프라 코어). 서류 경쟁력은 이미 "깊은 Java + 결제·분산 도메인"이 본체 |
| **원리 학습** | **Rust** | ⭕ 흥미 기반으로 추천 | 소유권·borrow checker = [JMM](cs/deep-jmm.md)·[GC](unity/deep-gc.md)에서 본 메모리 문제의 **제3의 답** — GC도 수동 해제도 아닌, "누가 주인인가"를 **컴파일 타임에 증명**. Mozilla가 브라우저 메모리 버그를 없애려 만든 탄생 배경까지, 이 저장소의 학습 방식(원리·역사·트레이드오프)에 정확히 맞는 주제 |

**우선순위 (지금 기준)**:

```
1. 코딩테스트 (진행 중 — 중단 금지)          → coding-test-2week.md
2. 면접 방어 (정량 성과 문답 — 미완)          → 5장 병행 과제
3. Kotlin 맛보기 (1~2주, 이직 직결)
4. Rust (원리 트랙 — 여유 시, JMM→GC→소유권으로 이어지는 딥다이브 후보)
```

> 요약: **취업은 Kotlin, 교양은 Rust, 지금 당장은 둘 다 아니고 코테.**

---

## 연결 지도
- 관심사 기반 로드맵(ML·그래픽스): → [roadmap.md](roadmap.md)
- CS 근간: → [cs/cs-foundations.md](cs/cs-foundations.md)
- 설계 원칙·트레이드오프 렌즈: → [engineering-concepts-map.md](engineering-concepts-map.md)
- 면접 답변 프레임워크: → [interview/explain-your-code.md](interview/explain-your-code.md)

_이 문서는 계획이다. 각 항목을 실제로 팔 때마다 딥다이브 노트를 만들고 여기에 링크를 건다._
