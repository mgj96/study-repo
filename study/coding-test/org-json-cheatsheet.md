# 치트시트 — org.json 시험장 암기 세트

> [REST API 유형](rest-api-pagination.md)을 풀 때 **외우고 들어가야 하는 API 표면 전부**. 시험 전날 이 한 장만 다시 볼 것.
> 실전 배경: 정규식 파싱 시도로 시간을 잃은 경험에서 나온 정리 — **파서 API를 손가락이 기억하면 그 시간이 통째로 돌아온다.**
> 관련: [코딩테스트 2주 로드맵 §2 (Java 함정 모음)](../coding-test-2week.md)

---

## 0. 최소 암기 세트 — 이 7개면 문제가 풀린다

```java
import org.json.*;                                  // ① 이 한 줄 (사전 설치, pom 불필요)

JSONObject root = new JSONObject(body);             // ② 문자열 → 객체 (진입점)
int totalPages  = root.getInt("total_pages");       // ③ 정수 필드
JSONArray data  = root.getJSONArray("data");        // ④ 배열 꺼내기
for (int i = 0; i < data.length(); i++) {           // ⑤ 순회는 length() — size() 아님!
    JSONObject item = data.getJSONObject(i);        // ⑥ 배열의 i번째 객체
    double v = item.optDouble("fat", -1);           // ⑦ 안전 읽기 (누락 시 기본값)
}
```

이 7줄이 손에 붙어 있으면 REST API 문제의 파싱부는 생각 없이 나온다 — **생각은 집계 로직에만 쓴다.**

---

## 1. get vs opt — 이 구분이 예외 지옥을 가른다

| 상황 | `get*` 계열 | `opt*` 계열 |
|---|---|---|
| 키가 없으면 | **JSONException 던짐** 💥 | 기본값 반환 (안전) |
| 타입이 다르면 | 예외 (getString에 숫자 등) | 최대한 변환하거나 기본값 |
| 언제 쓰나 | "반드시 있어야 하는" 필드 (`total_pages`) — 없으면 어차피 버그 | 항목마다 있을 수도 없을 수도 있는 필드 (`fat`) |

```java
root.getInt("total_pages");        // 구조 필드: 없으면 터지는 게 맞다
item.optDouble("fat", -1);         // 데이터 필드: 누락 항목은 건너뛰게
item.optString("name");            // 기본값 "" — 어떤 타입이든 문자열로 강제 변환됨
item.has("fat");                   // 존재 확인
item.isNull("fat");                // 존재하지만 null인 경우 구분
```

> **강제 변환 규칙 2개 (자주 나옴)**: ① `getDouble`/`optDouble`은 `"32.1"`처럼 **문자열로 온 숫자도 파싱**해 준다 ② `optString`은 숫자·불리언도 **toString으로 강제 변환** — 반면 `getString`은 진짜 String이 아니면 예외. 타입이 애매하면 opt 쪽이 산다.

---

## 2. JSONArray — 헷갈리는 것만

```java
JSONArray arr = root.getJSONArray("data");
arr.length();                      // ⚠️ size() 아님, count() 아님 — length()
arr.getJSONObject(i);              // 객체 배열
arr.getString(i);                  // 문자열 배열
arr.getJSONArray(i);               // 중첩 배열
```

- 향상된 for문(`for (Object o : arr)`)도 되지만 **캐스팅이 필요**해서 인덱스 루프가 실수 적음
- 빈 배열은 `length() == 0` — null이 아니라 빈 배열로 오는 게 jsonmock 관례

---

## 3. 중첩 접근 — 한 줄 체이닝

```java
// { "user": { "rating": { "average": 4.5 } } }
double avg = root.getJSONObject("user")
                 .getJSONObject("rating")
                 .getDouble("average");
```

중간 단계가 없을 수 있으면 `optJSONObject`(없으면 **null 반환** — 체이닝 끊고 null 체크):

```java
JSONObject rating = item.optJSONObject("user_rating");
double avg = (rating != null) ? rating.optDouble("average_rating", 0) : 0;
```

---

## 4. 출력을 JSON으로 내야 할 때 (드물지만 나옴)

```java
JSONObject out = new JSONObject();
out.put("name", best);                 // put은 체이닝 가능
out.put("total", maxFat);
System.out.println(out.toString());    // {"name":"...","total":...}
```

---

## 5. 예외 시나리오 3개 — 시험장 디버깅 순서

| 증상 | 원인 | 수정 |
|---|---|---|
| `JSONObject["fat"] not found` | 키 누락 항목 존재 | `get` → `opt`로 교체 |
| `JSONObject["name"] not a string` | 타입 불일치 (숫자를 getString) | `optString` (강제 변환) |
| `A JSONObject text must begin with '{'` | 응답이 JSON이 아님 — 에러 HTML, 빈 문자열, 또는 배열(`[`)로 시작 | `res.body()` 먼저 출력해 눈으로 확인 / 배열이면 `new JSONArray(body)` |

세 번째가 의외로 흔하다 — **파싱 코드를 의심하기 전에 body를 한 번 찍어봐라.** 5초짜리 확인이 30분을 아낀다.

---

## 6. Jackson 미니 대조표 (보일러플레이트가 Jackson으로 온 경우)

문제 템플릿이 Jackson(`ObjectMapper`)을 이미 import한 채 주어지면 갈아타지 말고 그대로:

| 하려는 것 | org.json | Jackson |
|---|---|---|
| 진입 | `new JSONObject(body)` | `om.readTree(body)` → `JsonNode` |
| 정수 필드 | `root.getInt("k")` | `root.get("k").asInt()` |
| 배열 순회 | `for (i < arr.length())` | `for (JsonNode n : root.get("data"))` |
| 안전 접근 | `optDouble("k", -1)` | `root.path("k").asDouble(-1)` (`path`는 없어도 안 터짐) |

암기 부담을 줄이는 규칙: **org.json은 opt가 안전, Jackson은 path가 안전.**

---

## 🤔 자가 테스트 (답은 위에서 찾기)

1. 배열 크기는 `size()`인가 `length()`인가?
2. `"fat": "32.1"`(문자열)을 double로 읽는 가장 안전한 호출은?
3. `total_pages`를 읽을 때 get과 opt 중 뭐가 맞고, 왜?
4. `A JSONObject text must begin with '{'` 예외 — 코드 고치기 전에 먼저 할 일은?
5. Jackson에서 org.json의 `opt*`에 해당하는 안전 접근자는?

---

## 3단 요약 (암기)

- **① 결론 · WHAT** — org.json은 **진입 1개(`new JSONObject`) + 읽기 2계열(get/opt) + 배열 3개(`length`·`getJSONObject`·순회)**가 전부다. 0단계의 7줄이 시험장 최소 세트.
- **② 원리 · HOW** — get은 "없으면 터져야 하는 구조 필드"용, opt는 "있을 수도 없을 수도 있는 데이터 필드"용 — 예외 설계 철학이 이름에 박혀 있다. 강제 변환(`optDouble`의 문자열 숫자, `optString`의 만능 toString)이 지저분한 실전 응답을 흡수한다.
- **③ 확장 · TRADE-OFF** — org.json은 단순한 대신 POJO 매핑이 없다(그건 Jackson/Gson의 영역 — Spring에서 매일 쓰는 그쪽). 코테처럼 "필드 몇 개 뽑기"엔 org.json이 가장 빠르고, 응답 전체를 객체로 다뤄야 하면 Jackson `readValue`로 넘어간다. 어느 쪽이든 **정규식은 후보가 아니다** — JSON은 중첩 구조라 정규식의 표현력 밖이다.
