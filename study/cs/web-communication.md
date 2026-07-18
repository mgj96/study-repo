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

## 1. 데이터 형식 — JSON vs XML

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

| | JSON | XML |
|---|------|-----|
| 무게 | 가벼움 | 무거움(태그 중복) |
| 가독성 | 좋음 | 장황 |
| 스키마·검증 | 약함(별도 도구) | 강함(XSD) |
| 주 용도 | REST·웹 API | SOAP·엔터프라이즈 |

---

## 2. 통신 방식 한눈 비교

| 방식 | 형식 | 특징 | 언제 | 자바 |
|------|------|------|------|------|
| **SOAP** | XML(강제) | 엄격·표준·보안(WS-*)·무거움, **WSDL 계약** | 레거시 엔터프라이즈(은행·공공) | **JAX-WS** |
| **REST** | 주로 JSON | HTTP 메서드+URL로 자원 다룸, 단순·표준 | **대부분의 웹 API** | Spring MVC, JAX-RS |
| **gRPC** | Protobuf(바이너리) | 빠름·**양방향 스트리밍**·proto 계약 | MSA **내부** 통신 | grpc-java |
| **GraphQL** | JSON | 클라가 **필요한 필드만** 질의 | 과다/과소 요청 해결 | graphql-java |
| **WebSocket** | 자유 | **양방향 실시간** 연결 유지 | 채팅·푸시·실시간 | Spring WebSocket |

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
| 무게 | 무거움 | 가벼움 |
| 강점 | 표준 보안·트랜잭션 | 단순·확장·캐시 |
| 지금 | 레거시 유지보수 | **신규 기본** |

---

## 4. 언제 뭘 쓰나 (결정)

- **일반 웹/모바일 API** → **REST + JSON** (기본값)
- **은행·공공·기존 엔터프라이즈 연동** → **SOAP**(이미 그렇게 깔림)
- **MSA 서비스 간 고속 내부 통신** → **gRPC**
- **화면마다 필요한 데이터가 다르고 과다요청이 문제** → **GraphQL**
- **채팅·실시간 알림** → **WebSocket**

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

---

## 한 줄 요약

**형식(JSON·XML)과 방식(SOAP·REST·gRPC·GraphQL)은 다른 층**이다. "JSON 통신"은 형식, "SOAP 통신"은 방식. 지금 **기본은 REST+JSON**, **SOAP은 XML 강제·엄격·레거시**(은행·공공), **gRPC는 내부 고속**, **GraphQL은 필요한 필드만**, **WebSocket은 실시간**. 자바로는 REST=Spring MVC, SOAP=JAX-WS, JSON=Jackson.

## 참조
- [MDN — HTTP](https://developer.mozilla.org/ko/docs/Web/HTTP) · [gRPC](https://grpc.io/) · [GraphQL](https://graphql.org/)
