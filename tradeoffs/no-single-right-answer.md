# 정답은 없다 — 실무 경험담과 대체 방식

> 학습용 문서. 교과서·유행이 항상 정답은 아니다. 아래 사례는 **남의 맥락에서의 결정**이며,
> 그대로 베끼는 순간 또 다른 cargo cult가 된다. "내 병목·규모·팀에 맞나?"를 always 먼저.
> 각 사례: 통념 → 실제 선택 → 왜 통했나 → **단, 반대 맥락에선?**

## 사례 1. Redis 분산락 걷어내고 → DB 행 단위 락

**통념**: "동시성 제어엔 Redis 분산락(SETNX/Redlock)." 빠르고 표준처럼 쓰인다.

**실제 선택**: Redis를 제거하고 **DB의 행 단위 락**(`SELECT ... FOR UPDATE`, 비관적 락)으로
전환. 나아가 **핫 로우(hot row)를 여러 행으로 쪼개** 락 경합을 분산 → 처리량 증가.

**왜 통했나**
- 모든 앱 인스턴스가 **같은 DB를 공유**하면, 락을 DB 한 곳에서 잡아도 정합성이 보장된다.
  → Redis라는 **별도 인프라 + 네트워크 왕복 + 장애 지점**을 통째로 제거.
- 단일 카운터(재고 등)에 모두가 몰리면 그 한 행에 락이 집중(hot row)되어 직렬화됨.
  값을 **N개 행으로 분산**(예: 재고 1000을 100씩 10행)하면 락 경합이 1/N로 줄어 동시성↑.
  (네트워크 왕복 제거 → [네트워크 기초](../cs-fundamentals/networking-basics.md),
   락 경합 = 직렬화 → [동시성](../cs-fundamentals/concurrency-vs-parallelism.md))

**단, 반대 맥락에선?**
- DB 락은 **열린 트랜잭션을 잡고** 기다리게 한다 → 경합이 극심하거나 트랜잭션이 길면
  커넥션 고갈·데드락 위험. 이때는 Redis 분산락이나 큐 직렬화가 더 나을 수 있다.
- 여러 DB 노드(샤딩/멀티마스터)로 흩어지면 단일 DB 락만으론 부족 → 외부 락 필요.
- **부하 이관 관점(중요)**: DB 기반(행락·`UPDATE WHERE`)은 빠르고 단순하지만, 그 부하가
  **전부 DB로 집중**된다. DB는 보통 **수평 확장이 가장 어려운 공유 자원**(단일 프라이머리) →
  핫로우 쓰기가 몰리면 **다른 모든 쿼리까지 느려진다**. Redis를 쓰는 핵심 이유 중 하나가
  바로 이 **조율 부하를 DB 밖(싸게 확장되는 메모리)으로 분리**하는 것.
  → "이 작업만 빠르냐"가 아니라 "**공유 자원(DB)에 얼마나 부담을 주느냐**"까지 봐야 한다.
출처: [Pessimistic vs distributed lock 논의](https://dev.to/tyroopam9599/beyond-setnx-implementing-a-production-grade-distributed-lock-with-nodejs-and-redis-lua-scripts-2p1b)

> ▶ **직접 돌려보기**: 이 사례를 Docker로 측정하는 벤치마크 →
> [mgj96/lab-benchmarks](https://github.com/mgj96/lab-benchmarks)
> (none/redis-lock/db-row-lock/db-atomic/db-split-lock 5전략 처리량·정합성 비교)

## 사례 2. Prime Video: 마이크로서비스/서버리스 → 모놀리스 (비용 90%↓)

**통념**: "확장성 있게 가려면 마이크로서비스·서버리스."

**실제 선택**: Amazon Prime Video 영상품질분석(VQA) 팀이 분산 서비스(Step Functions + S3
중간저장)를 **단일 ECS 태스크(모놀리스)** 로 통합 → **비용 90% 절감**.

**왜 통했나**
- Step Functions는 상태 전이마다 과금인데 초당 수많은 전이 발생 → 오케스트레이션 비용 폭발.
- 컴포넌트를 한 프로세스에 합쳐 **프레임 전달을 S3가 아닌 메모리 안에서** 처리
  → 비싼 데이터 이동(네트워크·스토리지 왕복) 제거. ([메모리 계층](../cs-fundamentals/memory-hierarchy-and-latency.md))

**단, 반대 맥락에선?**
- 이건 **특정 워크로드(고빈도 스트림 처리) 한정** 결과다. "마이크로서비스는 틀렸다"는
  일반화가 아니다. 팀 독립 배포·장애 격리가 중요한 조직엔 여전히 분산이 맞다.
- Amazon 내부에서도 "한 팀의 한 사례"라고 선을 그었다.
출처: [원문 정리(thestack)](https://www.thestack.technology/amazon-prime-video-microservices-monolith/)

## 사례 3. "Redis/Kafka 대신 그냥 Postgres"

**통념**: "큐는 Kafka/RabbitMQ, 캐시는 Redis."

**실제 선택**: 많은 팀이 큐·캐시·pub/sub를 **Postgres 하나로** 해결 (Dan McKinley의
"Choose Boring Technology" 철학). 새 인프라가 주는 운영 부담을 피함.

**왜 통했나**
- "확장의 cargo cult" — 아직 그 규모가 아닌데 대규모용 도구를 미리 도입(조기 최적화).
- 도구 하나 추가 = 학습·운영·장애대응 비용. Postgres로 충분하면 **스택 단순화**가 이득.

**단, 반대 맥락에선?**
- 진짜 대규모(초당 수십만, 다중 소비자, 로그 보존)면 Kafka가 맞다.
  "Just use Postgres considered harmful" 같은 **반론**도 존재. → 규모가 임계를 넘으면 전용 도구로.
출처: [Choose Postgres queue](https://adriano.fyi/posts/2023-09-24-choose-postgres-queue-technology/),
[반론(lobste.rs)](https://lobste.rs/s/kbp8xn/you_don_t_need_kafka_just_use_postgres)

## 통념을 깨는 추가 사례 (확증편향 점검용)

"내 도메인에선 무조건 X"라고 굳어진 믿음을 흔드는 빠른 사례들.

### 4. "NoSQL이 SQL보다 확장성 좋다"
- **그렇지 않다 / 그런 것도 있다**: Postgres가 "데이터베이스 세계를 먹는" 추세.
  MongoDB 4년 쓰다 Postgres로 회귀한 팀들 다수. RDB가 **JSONB**로 NoSQL의 유연성까지 흡수.
- **단서**: "SQL 승리"가 아니라 **둘 다 전략적으로**. 특정 니치(초고속 키-값, 시계열)는 여전히 NoSQL.
  진짜 정답은 "내 데이터 모델·일관성 요구에 맞나".
  출처: [Postgres로 회귀](https://medium.com/@the_atomic_architect/nosql-vs-sql-in-2026-why-we-moved-back-to-postgres-after-4-years-of-mongodb-flexibility-fdf6eada1477), [Why SQL beating NoSQL](https://www.tigerdata.com/blog/why-sql-beating-nosql-what-this-means-for-future-of-data-time-series-database-348b777b847a)

### 5. "인덱스는 무조건 빠르게 한다"
- **그렇지 않다**: 인덱스마다 INSERT/UPDATE/DELETE 시 함께 갱신 → **쓰기가 N배 느려짐**.
  안 쓰는 인덱스는 순손해(저장·캐시 압박·옵티마이저 혼란). 읽기를 빠르게 하려다 쓰기를 망친다.
- **단서**: 읽기 vs 쓰기 트레이드오프. **실제 쓰이는 쿼리 기준**으로 최소한만. 주기적으로 미사용 인덱스 정리.
  출처: [인덱스의 단점(PlanetScale)](https://planetscale.com/blog/what-are-the-disadvantages-of-database-indexes), [Percona](https://www.percona.com/blog/postgresql-indexes-can-hurt-you-negative-effects-and-the-costs-involved/)

### 6. "캐싱하면 빨라진다"
- **그런데 함정**: "캐시 무효화"는 CS 2대 난제. 대부분 버그는 캐싱 로직이 아니라
  **무효화를 빼먹은 쓰기**에서 나온다(stale data). 인기 키 만료 순간 요청이 몰리는
  **thundering herd**(트위터: 트렌딩 캐시 만료 → DB에 평소의 수백 배 부하).
- **단서**: 캐시는 공짜가 아니다. stale-while-revalidate·락 기반 단일 재생성·확률적 조기만료로 방어.
  출처: [Cache is the Root of All Evil](https://medium.com/box-tech-blog/cache-is-the-root-of-all-evil-e64ebd7cbd3b), [Thundering herd](https://dev.to/lazypro/handling-stale-sets-and-thundering-herds-of-cache-170c)

### 7. "PK는 UUID로 (분산 대비)"
- **그렇지 않을 수 있다**: 랜덤 UUID(v4)는 B-tree 곳곳에 삽입돼 **페이지 분할·단편화**,
  테이블이 커질수록 insert가 급격히 느려짐. 단일 노드면 **auto-increment가 훨씬 빠름**.
- **단서**: 분산·충돌 회피가 필요하면 UUID, 단 **정렬형(UUIDv7/ULID)** 으로 단편화 완화.
  "분산 대비"라는 막연한 이유로 단일 서비스에 랜덤 UUID를 쓰면 손해.
  출처: [UUID PK 주의(MySQL)](https://leapcell.io/blog/uuid-as-primary-key-in-mysql-can-hurt-performance), [UUIDv7/ULID 비교(arXiv)](https://arxiv.org/pdf/2509.08969)

### 8. "ORM은 느리니 생SQL 써야 / ORM이면 충분"
- **둘 다 아니다**: ORM은 생산성·가독성·이식성↑, 대신 복잡/대량 쿼리는 비효율.
  생SQL은 성능·세밀 제어↑, 대신 손이 많이 감.
- **단서**: 대부분 ORM, **병목 쿼리만 생SQL**로 — best of both. "무조건 한쪽"이 아니다.
  출처: [ORM vs Raw SQL](https://www.techtarget.com/searchsoftwarequality/tip/ORM-vs-SQL-When-to-use-each)

### 9. "정규화가 정석 / 비정규화가 빠름"
- **트레이드오프가 명확**: 정규화 = **쓰기 빠르고 읽기 느림**(JOIN), 비정규화 = **읽기 빠르고 쓰기 느림**(중복 동기화).
- **단서**: **쓰기:읽기 비율**이 결정. 쓰기 잦으면(OLTP) 정규화, 읽기·대시보드(OLAP)면 비정규화.
  실무는 핵심은 정규화 + 읽기 무거운 곳만 비정규화하는 **하이브리드**.
  출처: [정규화 vs 비정규화 트레이드오프](https://medium.com/@truongtud90/normalization-vs-denormalization-the-engineers-complete-guide-to-database-design-trade-offs-ab2ac1983a58)

### 10. "성능 최적화부터 하고 봐야" (Knuth 오해)
- **그렇지 않다**: Knuth의 "조기 최적화는 만악의 근원"은 **"측정 전에 최적화하지 말라"**는 뜻이지
  "최적화하지 말라"가 아니다. 직관적 추측은 거의 빗나가니, **프로파일링으로 진짜 3%를 찾아** 거기만.
- **단서**: 측정 없는 최적화는 시간 낭비 + 코드만 복잡. "느린 것 같다"가 아니라 **재서 결정**.
  출처: [Knuth 원문 맥락](https://probablydance.com/2025/06/19/revisiting-knuths-premature-optimization-paper/)

### 11. "비동기(async)가 동기보다 빠르다"
- **항상은 아니다**: async/await는 상태머신·컨텍스트 캡처 오버헤드가 있다. await 1회 ≈ 수 µs +
  수백 바이트 할당. **아주 짧은 작업**이나 **타이트한 루프**에선 동기보다 느리고 복잡하기만 하다.
- **단서**: 오버헤드는 **작업이 오래 걸릴수록 상대적으로 무의미** → 긴 I/O엔 async가 이득,
  짧고 빠른 작업엔 동기가 단순·빠름. "무조건 async"는 틀린 습관.
  출처: [async 오버헤드(InfoQ)](https://www.infoq.com/news/2013/07/async-await-pitfalls/),
  [동기 I/O 안티패턴(MS)](https://learn.microsoft.com/en-us/azure/architecture/antipatterns/synchronous-io/)

### 12. "서버리스(Lambda)가 더 싸다"
- **규모에 따라 역전**: 한 팀 Lambda 청구서 월 $12,247 → EC2 $315로 전환(약 39배 절감).
  요청당 단가가 광고의 22배였던 사례. PrimeVideo도 같은 맥락(서버리스 → ECS).
- **단서**: **트래픽 모양**이 정답을 가른다. 일정한 고트래픽 = 컨테이너/EC2 유리,
  드문드문 스파이크 = Lambda 유리. break-even을 넘으면 서버리스가 급격히 비싸진다.
  출처: [Lambda→EC2 비용 사례](https://medium.com/engineering-playbook/our-serverless-lambda-bill-hit-12-000-we-switched-back-to-ec2-for-400-heres-what-changed-9939039071e8),
  [서버리스 과금 분석](https://theburningmonk.com/2023/05/is-serverless-overpriced-what-can-we-learn-from-the-primevideo-team/)

## 메타 교훈 — 어떻게 판단할까

```
1. 통념/유행을 기본값으로 의심한다 ("왜 다들 X 쓰지?"가 아니라 "내 병목이 X로 풀리나?")
2. 병목을 측정한다 (추측 금지) → [scale-up vs out](../cs-fundamentals/scaling-up-vs-out.md)
3. 가장 단순한(boring) 선택부터 — 인프라 추가는 비용. 못 버틸 때 도입.
4. 경험담은 '그들의 맥락'. 정답이 아니라 사고의 보기(option)로 수집한다.
```

> 이 문서의 목적은 "Redis 빼고 DB 써라"가 **아니다.**
> "정답처럼 보이는 것도 맥락이 바뀌면 답이 달라진다"는 **태도**를 학습하는 것.
> (LLM 답·통념을 검증 없이 믿지 않는 이 레포의 일관된 원칙과 같다.)

## 관련 문서

- [Scale-up vs Scale-out](../cs-fundamentals/scaling-up-vs-out.md) — 병목부터 측정
- [동시성 vs 병렬성](../cs-fundamentals/concurrency-vs-parallelism.md) — 락·직렬화
- [메모리 계층과 지연시간](../cs-fundamentals/memory-hierarchy-and-latency.md) — 데이터 이동 비용
