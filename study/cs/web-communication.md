# 웹 통신·API 방식 — SOAP·REST·JSON·gRPC·GraphQL (자바 렌즈)

> 관점: "SOAP 통신? JSON 통신?"이 헷갈리는 이유는 **두 축을 섞어서**다 — **① 데이터 형식(JSON·XML)** 과 **② 통신 방식(SOAP·REST…)** 은 다른 층이다.
> 관련: REST 기초는 [qna/network.md](qna/network.md) Q10 · 자바 렌즈 [../lang/java/design-patterns.md](../lang/java/design-patterns.md).

---

## 0. 큰 그림 — 두 축을 나눠라

| 축 | 무엇 | 예 |
|----|------|-----|
| **데이터 형식** | 데이터를 **어떤 글자로** 담나 | JSON, XML, Protobuf |
| **통신 방식** | 데이터를 **어떤 규약으로** 주고받나 | SOAP, REST, gRPC, GraphQL |

> 흔한 혼동: "JSON 통신"은 **형식** 얘기, "SOAP 통신"은 **방식** 얘기. 예를 들어 **REST는 방식**이고 그 위에 **JSON(형식)** 을 얹는 게 보통이다. (SOAP은 방식이자 XML을 강제)

---

## 1. 데이터 형식 — JSON · XML · Protobuf

**JSON** (요즘 웹 표준)
```json
{ "name": "김철수", "age": 30, "roles": ["admin", "user"] }
```
- 가볍고 **사람이 읽기 쉬움**, 파싱 빠름. 자바: **Jackson**·Gson.

**XML** (SOAP의 몸통, 레거시)
```xml
<user>
  <name>김철수</name>
  <age>30</age>
</user>
```
- 무겁지만 **스키마(XSD) 검증·네임스페이스** 등 엄격. 자바: JAXB.

**Protobuf** (Protocol Buffers — 구글, **바이너리**)
```proto
message User {
  int32  id   = 1;    // 숫자 = "필드 번호"
  string name = 2;
  repeated string roles = 3;   // repeated = 리스트
}
```
- **언어·플랫폼 중립 직렬화 형식**. `.proto`로 스키마 정의 → 코드 자동 생성 → **바이너리로 인코딩**.
- 핵심 트릭: **필드 이름 대신 번호만 저장** → JSON보다 훨씬 작고 빠름. 대신 **사람이 못 읽음**(바이너리).
- 주 용도: **gRPC의 기본 형식**, 내부 고속 통신. 자바 렌즈: `Serializable`의 **언어중립·초경량판**, `.proto`는 WSDL의 가벼운 현대판.

| | JSON | XML | Protobuf |
|---|------|-----|----------|
| 형태 | 텍스트 | 텍스트(태그) | **바이너리** |
| 무게 | 가벼움 | 무거움 | **매우 가벼움** |
| 가독성 | 좋음 | 장황 | **못 읽음** |
| 스키마 | 약함(별도) | 강함(XSD) | 강함(.proto) |
| 속도 | 보통 | 느림 | **빠름** |
| 주 용도 | REST·웹 | SOAP | gRPC·내부 |

---

## 2. 통신 방식 한눈 비교

| 방식 | 형식 | 특징 | 언제 | 자바 |
|------|------|------|------|------|
| **SOAP** | XML(강제) | 엄격·표준·보안(WS-*)·무거움, **WSDL 계약** | 레거시 엔터프라이즈(은행·공공) | **JAX-WS** |
| **REST** | 주로 JSON | HTTP 메서드+URL로 자원 다룸, 단순·표준 | **대부분의 웹 API** | Spring MVC, JAX-RS |
| **gRPC** | Protobuf(바이너리) | 빠름·**양방향 스트리밍**·proto 계약 | MSA **내부** 통신 | grpc-java |
| **GraphQL** | JSON | 클라가 **필요한 필드만** 질의 | 과다/과소 요청 해결 | graphql-java |
| **SSE** | 텍스트(event) | 서버→클라 **단방향** 푸시, HTTP 그대로 | 알림·현황판·시세 | `SseEmitter` |
| **WebSocket** | 자유 | **양방향 실시간** 연결 유지 | 채팅·푸시·실시간 | Spring WebSocket |

> 실시간 방식(Polling·SSE·WebSocket)의 **운영 비용 비교**는 → 아래 **5장**.

---

## 3. SOAP vs REST — 자바 개발자 관점 (좀 더)

**SOAP** (Simple Object Access Protocol)
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getUser><id>42</id></getUser>
  </soap:Body>
</soap:Envelope>
```
- **XML 봉투(Envelope)** 로 감싸고, **WSDL**(계약서)로 인터페이스를 엄격히 정의.
- **엄격함**: 모든 필드·타입이 **WSDL/XSD 스키마로 고정** → **값이 계약대로 다 있어야** 주고받아진다(누락·타입 불일치면 거부). JSON(REST)은 느슨해서 필드가 있어도·없어도 됨.
- **표준 보안·트랜잭션(WS-Security, WS-*)** 이 강력 → 은행·공공·B2B 레거시에 아직 살아있음.
- 자바: **JAX-WS**(`@WebService`). 무겁고 장황.

**REST** (Representational State Transfer)
```
GET  /users/42        → 조회
POST /users           → 생성
PUT  /users/42        → 수정
DELETE /users/42      → 삭제
```
- **HTTP 그대로**: URL=자원, 메서드=행위. 가볍고 캐시·표준 친화. JSON과 궁합.
- 자바: **Spring MVC**(`@RestController`), JAX-RS.

| | SOAP | REST |
|---|------|------|
| 형식 | XML 고정 | 자유(주로 JSON) |
| 계약 | WSDL(엄격) | OpenAPI(느슨) |
| 필드 | **스키마로 다 정의·값 필수** | 느슨(선택적) |
| 무게 | 무거움 | 가벼움 |
| 강점 | 표준 보안·트랜잭션 | 단순·확장·캐시 |
| 지금 | 레거시 유지보수 | **신규 기본** |

---

## 4. 언제 뭘 쓰나 — "이럴 때 → 이거" (상황 기준으로 엮기)

**왼쪽(내 상황)에서 오른쪽으로 읽으면** 방식·형식·자바 도구가 한 세트로 나온다.

| 이럴 때(상황) | 방식 | 형식 | 자바 | 한 줄 |
|--------------|------|------|------|-------|
| **일반 웹·모바일 API**(기본) | **REST** | JSON | Spring MVC | 고민되면 이거 |
| **은행·공공·기존 엔터프라이즈 연동** | **SOAP** | XML(WSDL) | JAX-WS | 레거시라 따라감 |
| **MSA 서비스 간 내부 고속** | **gRPC** | Protobuf | grpc-java | 빠르고 계약 엄격 |
| **화면마다 필요한 필드가 다름** | **GraphQL** | JSON | graphql-java | 과다/과소 요청 해결 |
| **서버→클라 단방향 푸시**(알림·현황판) | **SSE** | 텍스트 | `SseEmitter` | HTTP 그대로, 재연결 내장 |
| **실시간 채팅·알림·게임** | **WebSocket** | 자유 | Spring WebSocket | 양방향 실시간 |

---

## 5. 실시간 통신 — 폴링·SSE·WebSocket, "연결당 비용"으로 고르기

HTTP의 원형은 **요청-응답**이다 — 클라이언트가 물어야 서버가 답한다. 그런데 "출차 완료됐어요", "주차면이 났어요"처럼 **서버가 먼저 말을 걸어야 하는** 순간이 온다. HTTP는 그 방법이 없어서, 전부 **우회 기법**이 나왔다. 우회마다 치르는 값이 다르고, **값의 본체는 "연결 하나를 유지하는 데 드는 서버 비용"** 이다.

### 5-1. 다섯 가지 우회 — 한눈 비교

| 방식 | 원리 | 방향 | 연결 유지 | 지연 | 서버 비용 |
|------|------|------|-----------|------|-----------|
| **Polling** | 주기적으로 "새 거 있어?" 반복 요청 | 클라→서버 | ❌ (매번 새로) | 주기만큼 | **거의 0** (무상태) |
| **Long Polling** | 요청을 열어두고 **이벤트가 생길 때까지 응답 보류** | 클라→서버 | 반쯤 | 낮음 | 대기 중 연결 점유 |
| **SSE** | HTTP 응답을 **안 끝내고 계속 흘려보냄** | **서버→클라 단방향** | ⭕ | 낮음 | 연결당 유지 비용 |
| **WebSocket** | HTTP로 악수 후 **별도 양방향 프로토콜로 승격** | **양방향** | ⭕ | 최저 | **연결당 유지 + 상태** |
| **gRPC 스트리밍** | HTTP/2 스트림 위 양방향 | 양방향 | ⭕ | 최저 | 연결당 유지 (내부망용) |

### 5-2. 왜 WebSocket이 메모리를 먹나

WebSocket 연결 하나 = **열린 소켓 + 세션 객체 + 버퍼**가 서버 메모리에 **계속** 산다. 접속자 1만 명이면 **아무 메시지가 없어도** 1만 개의 연결 상태를 유지한다.

```
Polling:    요청 → 응답 → 연결 끝.  서버는 아무것도 기억 안 함 (무상태)
WebSocket:  연결 → ...유지...유지...유지...  서버가 전원을 계속 기억함 (유상태)
```

더 아픈 건 **스케일아웃**이다:

- Polling은 무상태라 **아무 서버가 받아도 된다** — 그냥 서버를 늘리면 된다.
- WebSocket은 클라이언트가 **특정 서버에 붙어 있다.** 서버 A에 붙은 사용자에게 서버 B가 이벤트를 보내려면? **세션 어피니티**(같은 서버로 고정) 또는 **브로커 경유**(Redis pub/sub 등)가 필요하다. "실시간 붙이기"가 순식간에 분산 시스템 설계가 된다.

> **흔한 사고 패턴**: 실시간성이 낮은 화면(몇 분에 한 번 갱신되면 충분한 현황판)까지 WebSocket으로 만들어 **유휴 연결 수만 개가 메모리를 눌러** OOM·재기동 반복 → 해당 화면만 Polling으로 전환하면 해결. **"실시간처럼 보이는 것"과 "실시간이 필요한 것"의 구분**이 이 장의 전부다.

### 5-3. SSE — 저평가된 중간값

서버→클라 **단방향**이면 충분한 경우가 실무의 대부분이다(알림·시세·진행률·현황판). 그럴 때 SSE는:

- **그냥 HTTP다** — 프록시·방화벽·LB를 별도 설정 없이 통과. WebSocket의 업그레이드 헤더 이슈가 없다.
- **재연결이 내장** — 끊기면 브라우저가 알아서 다시 붙고, `Last-Event-ID`로 놓친 이벤트부터 이어받는다. WebSocket은 이걸 전부 직접 구현해야 한다.
- 스프링에선 `SseEmitter` 반환이면 끝.

**대가**: 단방향뿐(클라→서버는 별도 REST로), 텍스트만, (HTTP/1.1에선) 브라우저당 동시 연결 6개 제한 — HTTP/2에서는 사실상 해소.

### 5-4. 프록시·LB 뒤의 함정

긴 연결은 **중간 장비들이 끊는다**:

| 장비 | 문제 | 대응 |
|------|------|------|
| Nginx | `proxy_read_timeout`(기본 60초) 지나면 유휴 연결 절단 | 타임아웃 연장 + **하트비트**(주기적 ping/코멘트 이벤트) |
| LB·방화벽 | 유휴 커넥션 정리 정책 | 하트비트 주기를 정책보다 짧게 |
| Nginx+WebSocket | `Upgrade`/`Connection` 헤더를 전달해야 승격됨 | 프록시 설정 명시 |

> "로컬에선 되는데 운영에서 1분 뒤 끊겨요"의 정체가 대부분 이것이다. **연결 유지 방식을 쓰는 순간, 나와 클라이언트 사이의 모든 장비가 이해관계자가 된다.**

### 5-5. 결정 표 — 주기와 방향으로 고른다

| 갱신 주기 | 방향 | 선택 |
|-----------|------|------|
| 분 단위면 충분 | — | **Polling** (제일 단순한 게 정답) |
| 초 단위 | 서버→클라만 | **SSE** |
| 초 단위 | 양방향 (채팅·협업·게임) | **WebSocket** |
| 밀리초, 서비스 내부 | 양방향 | **gRPC 스트리밍** |

> 순서에 주목 — **Polling이 첫 후보다.** 연결 유지 방식은 "Polling으로 안 되는 이유"를 댈 수 있을 때만 올라간다. 실시간의 반대말은 느림이 아니라 **단순함**이고, 단순함은 공짜가 아니라 자산이다.

---

## 자바 렌즈 — 한눈 매핑

| 방식/형식 | 자바 도구 |
|-----------|-----------|
| JSON 파싱 | **Jackson**(스프링 기본), Gson |
| XML 바인딩 | JAXB |
| SOAP | **JAX-WS** (`@WebService`, WSDL) |
| REST 서버 | **Spring MVC** (`@RestController`), JAX-RS |
| REST 호출 | `RestTemplate`, `WebClient`, Feign |
| gRPC | grpc-java (`.proto`) |
| SSE | Spring MVC `SseEmitter` / WebFlux `Flux` |
| WebSocket | Spring WebSocket (+STOMP), 스케일아웃 시 Redis pub/sub |

---

## 한 줄 요약

**형식(JSON·XML)과 방식(SOAP·REST·gRPC·GraphQL)은 다른 층**이다. "JSON 통신"은 형식, "SOAP 통신"은 방식. 지금 **기본은 REST+JSON**, **SOAP은 XML 강제·엄격·레거시**(은행·공공), **gRPC는 내부 고속**, **GraphQL은 필요한 필드만**. 실시간은 **연결당 비용으로 고른다** — 분 단위면 Polling, 단방향이면 SSE, 양방향일 때만 WebSocket(유상태라 스케일아웃 비용까지 계산). 자바로는 REST=Spring MVC, SOAP=JAX-WS, JSON=Jackson, SSE=`SseEmitter`.

## 참조
- [MDN — HTTP](https://developer.mozilla.org/ko/docs/Web/HTTP) · [gRPC](https://grpc.io/) · [GraphQL](https://graphql.org/)
