# 딥다이브 — 트랜잭션 격리와 락: 같은 SELECT가 다른 값을 주는 이유

> 기반: **ANSI SQL-92 표준** · **Berenson et al., *A Critique of ANSI SQL Isolation Levels* (SIGMOD 1995)** · **Reed, *Naming and Synchronization...* (MIT 박사논문 1978, MVCC의 기원)** · **MySQL/PostgreSQL/Oracle 공식 문서**
> 형식: 30초 직관 → 역사 → 원리 → 트레이드오프. [qna/database.md](qna/database.md)의 3줄 답을 실무 깊이로 승격한 노트.
> 관련: 인덱스가 락 범위를 정하는 원리는 [deep-btree-index.md](deep-btree-index.md), JVM 쪽 낙관적 동시성은 [deep-jmm.md](deep-jmm.md), 스프링에서의 경계는 [../lang/java/deep-spring-transaction.md](../lang/java/deep-spring-transaction.md).

---

## 0. 30초 직관 — 트랜잭션 안에서 세상이 바뀐다

```sql
BEGIN;
SELECT balance FROM account WHERE id = 1;   -- 10,000원
-- ... 그 사이 다른 세션이 입금을 커밋 ...
SELECT balance FROM account WHERE id = 1;   -- 15,000원?  10,000원?
```

**정답은 "격리수준에 달렸다"** 다. READ COMMITTED면 15,000원(바뀐 세상이 보임), REPEATABLE READ면 10,000원(트랜잭션 시작 시점의 세상이 유지됨).

여기서 이 노트의 중심 질문이 나온다:

> **"다른 사람의 변경을 언제부터 보이게 할 것인가"** — 이걸 정하는 다이얼이 격리수준이고,
> 그 다이얼을 구현하는 두 기술이 **락**(못 보게 막기)과 **MVCC**(과거를 보여주기)다.

---

## 1. 격리수준 — 이상현상을 실제 SQL로 재현하기

### 1-1. 왜 "수준"이 여러 개인가 (1992)

완벽한 격리(SERIALIZABLE)는 비싸다 — 동시성이 죽는다. 그래서 ANSI SQL-92는 **"어떤 이상현상까지 허용할 것인가"** 로 단계를 나눴다. 격리수준은 기능이 아니라 **성능과 정확성의 거래 조건표**다.

### 1-2. 이상현상 3종 — 시나리오로

**① Dirty Read — 커밋 안 된 것을 읽음** (READ UNCOMMITTED에서만)

```
세션A: UPDATE account SET balance = 0 WHERE id = 1;   (아직 커밋 안 함)
세션B: SELECT balance ...  → 0원 읽음
세션A: ROLLBACK;                                       ← 0원은 존재한 적 없는 값
```
B는 **역사에 없던 값**으로 의사결정을 했다. 그래서 실무에서 READ UNCOMMITTED는 사실상 안 쓴다.

**② Non-Repeatable Read — 같은 행을 두 번 읽었는데 값이 다름** (READ COMMITTED까지 허용)

0장의 예가 정확히 이것이다. 한 트랜잭션 안에서 **같은 행**의 값이 변한다.

**③ Phantom Read — 같은 조건으로 두 번 읽었는데 행 수가 다름** (REPEATABLE READ까지 허용*)

```
세션A: SELECT count(*) FROM parking WHERE zone = 'B';  → 10건
세션B: INSERT INTO parking (zone) VALUES ('B'); COMMIT;
세션A: SELECT count(*) ...                             → 11건 (유령이 나타남)
```
②는 **행의 값**이, ③은 **행의 존재**가 변한다. 이 구분이 중요하다 — 값은 행 락으로 지킬 수 있지만, **"아직 없는 행"은 잠글 대상이 없기 때문**이다(→ 3장 갭 락).

### 1-3. 표 — 그리고 표의 함정

| 격리수준 | Dirty | Non-Repeatable | Phantom |
|---|---|---|---|
| READ UNCOMMITTED | 허용 | 허용 | 허용 |
| READ COMMITTED | 차단 | 허용 | 허용 |
| REPEATABLE READ | 차단 | 차단 | 허용* |
| SERIALIZABLE | 차단 | 차단 | 차단 |

> ⚠️ **이 표를 외우는 것으로 끝내면 안 되는 이유**: 1995년 Berenson 등(Microsoft·Sybase 연구진)이 *A Critique of ANSI SQL Isolation Levels*에서 **표준의 정의 자체가 불완전**함을 보였다 — 표에 없는 이상현상(Lost Update, Write Skew)이 존재하고, MVCC 기반 DB들의 실제 동작(Snapshot Isolation)은 이 표의 어느 칸에도 정확히 안 맞는다.
> 실무 결론: **"내 DB의 이 격리수준"이 무엇을 막는지는 표가 아니라 그 DB 문서로 확인한다.**
> 대표 사례 — *InnoDB의 REPEATABLE READ는 갭 락 덕에 팬텀을 상당 부분 막는다*(표와 다름). PostgreSQL의 REPEATABLE READ는 사실상 Snapshot Isolation이다.

### 1-4. 기본값이 제일 중요하다

| DB | 기본 격리수준 |
|---|---|
| Oracle | READ COMMITTED |
| PostgreSQL | READ COMMITTED |
| **MySQL(InnoDB)** | **REPEATABLE READ** |
| SQL Server | READ COMMITTED |

**같은 코드가 Oracle과 MySQL에서 다르게 동작한다.** 멀티 DB를 다루는 환경(Oracle·MariaDB·PostgreSQL 혼용)이라면 이 차이가 "가끔 나는 이상한 버그"의 단골 원인이다.

---

## 2. MVCC — 안 막고 과거를 보여준다

### 2-1. 발상의 전환 (1978)

락으로 격리를 구현하면 **읽기가 쓰기를 막고 쓰기가 읽기를 막는다.** 조회가 많은 시스템에선 치명적이다.

David Reed의 1978년 MIT 박사논문에서 기원한 **MVCC(다중 버전 동시성 제어)** 는 질문을 뒤집었다:

> "지금 값을 보여주려고 쓰기를 막을 게 아니라, **각 트랜잭션에게 자기 시작 시점의 과거 버전을 보여주면** 되지 않나?"

**읽기와 쓰기가 서로를 막지 않게 된다.** 읽는 쪽은 스냅샷을 보고, 쓰는 쪽은 새 버전을 만든다. git으로 치면 — 남이 push하는 동안에도 나는 **내가 clone한 시점의 스냅샷**을 계속 읽을 수 있는 것과 같다.

### 2-2. 구현은 DB마다 다르다 — 그리고 그 차이가 운영 이슈다

| DB | 옛 버전을 어디에 | 대가 |
|---|---|---|
| **Oracle** | **Undo 세그먼트** (별도 공간) | undo가 재사용되면 `ORA-01555 snapshot too old` |
| **MySQL(InnoDB)** | **Undo 로그** | 긴 트랜잭션이 있으면 undo가 못 지워져 부풀어 오름 |
| **PostgreSQL** | **테이블 안에** 옛 행을 그대로 둠 (xmin/xmax 표시) | 죽은 행 청소 = **VACUUM**. 안 돌면 테이블 비대·트랜잭션 ID 랩어라운드 |

> **공통 교훈 하나로 수렴한다**: 어떤 구현이든 **"오래 열려 있는 트랜잭션"이 독**이다.
> 스냅샷을 유지해줘야 하니 옛 버전을 못 지운다 → undo 고갈(Oracle), undo 비대(MySQL), VACUUM 불능(PostgreSQL).
> [Spring 노트](../lang/java/deep-spring-transaction.md) 5장의 "왜 짧은 트랜잭션이어야 하나(1987 Sagas)"의 저장엔진 버전이다.

---

## 3. 락의 실제 — 인덱스가 락 범위를 정한다

### 3-1. 행 락은 사실 "인덱스 레코드 락"이다

InnoDB에서 `UPDATE ... WHERE ...`는 **조건에 맞는 행**이 아니라 **스캔한 인덱스 레코드**를 잠근다. 결과가 같아 보이지만 전혀 다르다:

```sql
UPDATE parking SET status = 'OUT' WHERE car_no = '12가3456';

-- car_no에 인덱스 있음  → 그 레코드 근처만 잠김
-- car_no에 인덱스 없음  → 풀스캔 = 스캔한 전 행이 잠김 (사실상 테이블 락)
```

> **"인덱스 안 걸었더니 느리다"보다 무서운 게 "인덱스 안 걸었더니 다 잠긴다"** 다.
> 락 경합·데드락 장애의 상당수가 실행계획 문제다 — 인덱스 구조는 [deep-btree-index.md](deep-btree-index.md).

### 3-2. 갭 락 — 없는 행을 잠그는 법

팬텀(1-2 ③)을 막으려면 "아직 없는 행"의 자리를 잠가야 한다. InnoDB(REPEATABLE READ)는 **인덱스 레코드 사이의 틈(gap)** 을 잠근다:

```
인덱스 값:   10        20        30
             │← gap →│← gap →│
세션A: SELECT ... WHERE id BETWEEN 10 AND 30 FOR UPDATE;
세션B: INSERT id = 25  → 갭 락에 걸려 대기   ← 팬텀 차단
```

**대가**: 갭 락은 **실제 행보다 넓은 범위**를 잠근다. 서로 인접 갭을 잡고 상대 갭에 INSERT하려는 두 세션이 만나면 — **데드락**. "동시 INSERT가 많은 테이블에서 이유 모를 데드락"의 단골 원인이 이것이다.

### 3-3. 데드락 — 예방보다 탐지-재시도

```
세션A: 주차면 1 잠금 → 주차면 2 요청 (대기)
세션B: 주차면 2 잠금 → 주차면 1 요청 (대기)   ← 서로 영원히 대기
```

현대 DB는 **탐지 후 한쪽을 죽이는** 전략을 쓴다(InnoDB는 대기 그래프에서 사이클 발견 시 더 작은 트랜잭션 롤백). 그래서 애플리케이션의 의무는 두 가지다:

1. **락 순서 규약** — 여러 자원을 잠글 땐 항상 같은 순서로(예: id 오름차순). 사이클 자체가 안 생긴다.
2. **데드락 예외를 재시도** — 탐지-롤백은 정상 동작이다. `DeadlockLoserDataAccessException`을 버그가 아니라 **재시도 신호**로 다룬다.

### 3-4. 낙관적 락 — DB 버전의 CAS

[deep-jmm.md](deep-jmm.md)에서 본 CAS("기대한 값 그대로면 커밋, 아니면 재시도")의 DB 버전이 **버전 컬럼**이다:

```sql
UPDATE parking SET status = 'OUT', version = version + 1
 WHERE id = 42 AND version = 7;   -- 내가 읽었던 버전 그대로일 때만 성공
-- 영향 행 수 0 = 누가 먼저 바꿈 → 다시 읽고 재시도 (또는 사용자에게 알림)
```

| | 비관적 락 (`FOR UPDATE`) | 낙관적 락 (version) |
|---|---|---|
| 충돌이 잦으면 | 유리 (재시도 낭비 없음) | 재시도 폭풍 |
| 충돌이 드물면 | 락 대기가 낭비 | **유리** |
| 커넥션 점유 | 대기 동안 계속 쥠 | 안 쥠 |
| 대상 | DB 안에서 완결 | **화면 조회 후 저장** 같은 긴 흐름에도 가능 |

> 마지막 줄이 실무 포인트다. "관리자 화면에서 열어두고 30분 뒤 저장" 같은 흐름은 비관적 락으론 못 지킨다(그동안 커넥션을 쥘 수 없으니). **긴 사용자 흐름 = 낙관적 락**이 기본 선택이다.
> 재시도 전략은 [분산 정합성 노트](deep-distributed-consistency.md)의 멱등성과 만난다 — 재시도가 안전하려면 그 연산이 멱등해야 한다.

---

## 4. 3단 요약 (암기용)

### Q1. 격리수준은 뭘 기준으로 고르나?

- **① 결론 · WHAT** 격리수준은 기능이 아니라 **"어떤 이상현상까지 감수하고 동시성을 살 것인가"의 거래 조건**이다. 대부분의 서비스는 **DB 기본값(READ COMMITTED 또는 InnoDB의 REPEATABLE READ)** 으로 충분하고, 돈 계산 같은 구간만 락이나 낙관적 버전으로 좁게 보강한다.
- **② 원리 · HOW** 낮출수록 Dirty → Non-Repeatable → Phantom 순으로 이상현상이 허용된다. 단 ANSI 표는 불완전하다(Berenson 1995) — Lost Update·Write Skew는 표에 없고, MVCC DB의 실제 동작(Snapshot Isolation)은 표의 칸에 안 맞는다. InnoDB의 RR은 갭 락으로 팬텀을 상당 부분 막고, PostgreSQL의 RR은 사실상 스냅샷 격리다.
- **③ 확장 · TRADE-OFF** 전역으로 SERIALIZABLE을 올리는 건 거의 항상 과잉이다(동시성 붕괴·데드락 급증). 반대로 기본값에만 의존하면 Oracle과 MySQL의 **기본값이 달라** 같은 코드가 다르게 동작한다 — 멀티 DB 환경에서는 격리수준을 명시적으로 문서화해야 한다.

### Q2. MVCC는 어떻게 락 없이 일관된 읽기를 주나?

- **① 결론 · WHAT** 쓰기를 막는 대신 **각 트랜잭션에게 시작 시점의 과거 버전(스냅샷)을 보여준다.** 읽기와 쓰기가 서로를 막지 않는다.
- **② 원리 · HOW** 쓰기는 제자리 덮어쓰기가 아니라 **새 버전 생성**이고, 옛 버전은 Oracle=undo 세그먼트, MySQL=undo 로그, PostgreSQL=테이블 내 죽은 행(xmin/xmax)으로 보관된다. 읽는 쪽은 자기 스냅샷에 보이는 버전만 고른다.
- **③ 확장 · TRADE-OFF** 옛 버전 보관이 비용이다 — 그리고 **긴 트랜잭션이 그 청소를 막는다**: `ORA-01555`, undo 비대, VACUUM 불능이 전부 같은 뿌리다. 또 MVCC의 "일관된 읽기"는 **쓰기 충돌까지 막아주진 않아서**(Lost Update·Write Skew), 갱신 경합은 여전히 락이나 버전 컬럼으로 따로 지켜야 한다.

### Q3. 데드락이 났다. 어떻게 대응하나?

- **① 결론 · WHAT** 단기: **데드락 예외를 재시도**한다(DB의 탐지-롤백은 정상 동작). 장기: **락 획득 순서를 통일**하고, **실행계획을 확인**한다(인덱스 없는 UPDATE가 광범위 락의 주범).
- **② 원리 · HOW** InnoDB의 행 락은 실제로는 **스캔한 인덱스 레코드 락**이라, 인덱스가 없으면 풀스캔 = 전 행 잠금이 된다. REPEATABLE READ에서는 **갭 락**이 실제 행보다 넓은 범위를 잠가, 동시 INSERT가 많은 테이블에서 서로의 갭을 물고 데드락이 난다.
- **③ 확장 · TRADE-OFF** 데드락을 0으로 만드는 건 목표가 아니다 — 예방(순서 규약)에는 설계 비용이, 회피(락 최소화)에는 정합성 리스크가 붙는다. 현실 균형은 **"드물게 나고, 나면 자동 재시도로 흡수"**. 충돌이 드문 긴 사용자 흐름은 애초에 락 대신 **낙관적 버전 컬럼**(DB판 CAS)으로 설계하는 게 데드락 표면적 자체를 줄인다.

---

## 용어 사전

| 용어 | 뜻 |
|------|-----|
| 격리수준 | 다른 트랜잭션의 변경을 언제부터 보이게 할지의 단계 |
| Dirty / Non-Repeatable / Phantom | 미커밋 읽음 / 같은 행 값 변함 / 행 수 변함 |
| Lost Update | 두 갱신이 겹쳐 한쪽이 조용히 사라짐 (ANSI 표 밖) |
| Write Skew | 각자 검사 후 각자 갱신해 불변식이 깨짐 (스냅샷 격리의 구멍) |
| MVCC | 다중 버전 동시성 제어. 스냅샷을 보여줘 읽기-쓰기 비차단 |
| Snapshot Isolation | 트랜잭션 시작 시점 스냅샷 기반 격리. PostgreSQL RR의 실체 |
| undo / VACUUM | 옛 버전 보관소(Oracle·MySQL) / PostgreSQL의 죽은 행 청소 |
| 갭 락 | 인덱스 레코드 사이 틈을 잠가 팬텀 INSERT를 차단 |
| 락 순서 규약 | 여러 자원을 항상 같은 순서로 잠가 사이클 예방 |
| 낙관적/비관적 락 | 버전 검사 후 재시도 / 먼저 잠그고 작업 |
| 버전 컬럼 | 낙관적 락 구현용 정수 컬럼. DB판 CAS |

## 연결 지도
- **인덱스 구조 (락 범위의 결정자)**: → [deep-btree-index.md](deep-btree-index.md)
- **JVM의 CAS·낙관적 동시성 (동형 원리)**: → [deep-jmm.md](deep-jmm.md)
- **스프링에서의 트랜잭션 경계·전파**: → [../lang/java/deep-spring-transaction.md](../lang/java/deep-spring-transaction.md)
- **재시도와 멱등성**: → [deep-distributed-consistency.md](deep-distributed-consistency.md)
- **3줄 버전 (출발점)**: → [qna/database.md](qna/database.md)
- **학습 순서**: → [../backend-roadmap.md](../backend-roadmap.md)

## 출처
- ANSI X3.135-1992 (SQL-92) — 격리수준 정의
- Berenson, H. et al. *A Critique of ANSI SQL Isolation Levels.* SIGMOD 1995 — https://arxiv.org/abs/cs/0701157
- Reed, D. P. *Naming and Synchronization in a Decentralized Computer System.* MIT 박사논문, 1978 — MVCC의 기원
- MySQL Reference Manual, *InnoDB Locking* (record·gap·next-key locks) — https://dev.mysql.com/doc/refman/en/innodb-locking.html
- PostgreSQL Documentation, *Transaction Isolation / Routine Vacuuming* — https://www.postgresql.org/docs/current/transaction-iso.html

_짧은 인용은 출처 표기. 락 세부 동작은 DB·버전·설정에 따라 다르므로 반드시 해당 버전 문서로 확인._
