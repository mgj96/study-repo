# 기출 복기 — REST API 페이지네이션 문제 (특정 필드 최댓값 찾기)

> 실전(HackerRank REST API 인증·기업 코테)에서 만난 유형. "fat이 최고인 항목", "평점 최고 식당", "총 골 수" 전부 **같은 템플릿 하나**다.
> 진행 방식은 [이진 조합 노트](binary-distinct-combinations.md)와 동일 — **🤔 생각 → 📖 읽기 → ✅ 확인** 순서로.
> 관련: [코딩테스트 2주 로드맵](../coding-test-2week.md) · 원리가 궁금하면 [웹 통신·API](../cs/web-communication.md)

---

## 0단계. 문제 판별 — 이건 알고리즘 문제가 아니다

REST API 문제의 정체를 먼저 확정한다:

> **알고리즘 난이도 = 최하 (max 추적이 전부). 진짜 시험 대상 = HTTP 호출·JSON 파싱·페이지네이션을 실수 없이 하는가.**

즉 "머리 쓰는 문제"가 아니라 **"빠뜨리면 0점 나는 체크리스트 문제"**다. 형태는 항상 이렇다:

```
GET https://jsonmock.hackerrank.com/api/<자원>?<필터>=<값>&page=<번호>

응답: {
  "page": 1,          ← 현재 페이지
  "per_page": 10,
  "total": 27,
  "total_pages": 3,   ← ★ 이 문제의 심장
  "data": [ { "name": "...", "fat": 32.1, ... }, ... ]
}
```

요구: 조건에 맞는 항목 중 **특정 필드(fat 등)가 최대인 것**의 이름(또는 값) 반환.

---

## 1단계. 🤔 생각 — 왜 이 문제의 오답 1위가 "한 페이지만 처리"인가?

*(위 응답 예시를 다시 보라. data에 10개가 왔다. 답을 내도 되나?)*

<details><summary>📖 추론 열기</summary>

`total=27`인데 `data`에는 10개뿐 — **나머지 17개는 2, 3페이지에 있다.** 최댓값이 3페이지에 숨어 있으면 1페이지만 본 코드는 그럴듯한 오답을 낸다(테스트케이스 일부는 통과해서 더 위험하다).

그래서 이 유형의 뼈대 사고는 하나다:

> **"첫 응답은 데이터가 아니라 지도다."** 첫 호출에서 `total_pages`를 읽고, 1부터 total_pages까지 **전부 순회**해야 데이터를 다 본 것이다.

</details>

**✅ 확인**: 내 루프가 `while (page <= totalPages)` 꼴이고, `totalPages`가 **응답에서 갱신**되는지(하드코딩 아님) 확인. `data`가 빈 배열인 페이지가 와도 죽지 않는지도.

---

## 2단계. 🤔 생각 — 순회하면서 무엇을 들고 다녀야 하나?

*(27개 항목을 List에 다 모아서 마지막에 정렬해야 하나?)*

<details><summary>📖 추론 열기</summary>

전부 모을 필요가 없다. 묻는 건 "최대 하나"뿐이므로 —

> **지금까지의 최댓값과 그 주인, 변수 2개**면 끝이다. 스트리밍으로 페이지를 읽어 버리면서 `max`만 갱신한다.

이건 [이진 조합 노트](binary-distinct-combinations.md) 1단계와 같은 전환이다: "다 만들어 놓고 고르기"가 아니라 **"지나가면서 세기/고르기"**. 합계형 문제(total goals)면 변수 1개(sum), 목록형 문제(조건 만족 이름 전부)일 때만 List에 모은다 — **지문이 뭘 반환하라는지가 자료구조를 정한다.**

</details>

**✅ 확인**: 내 코드에 페이지 전체를 담는 컬렉션이 없는지(최댓값 문제라면 불필요), 갱신 조건이 지문의 동점 규칙과 맞는지(5단계에서 재확인).

---

## 3단계. 결론 — 만능 템플릿 (Java 11+ HttpClient)

```java
import java.net.URI;
import java.net.http.*;
import com.fasterxml.jackson.databind.*;      // 환경에 없으면 Gson으로 동일 구조

public class Solution {
    public static String highestFatItem(String city) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        ObjectMapper om = new ObjectMapper();

        String best = null;
        double maxFat = -1;
        int page = 1, totalPages = 1;                       // 첫 바퀴는 일단 돌게

        while (page <= totalPages) {
            String url = "https://jsonmock.hackerrank.com/api/food"
                       + "?city=" + java.net.URLEncoder.encode(city, "UTF-8")
                       + "&page=" + page;
            HttpResponse<String> res = client.send(
                HttpRequest.newBuilder(URI.create(url)).GET().build(),
                HttpResponse.BodyHandlers.ofString());

            JsonNode root = om.readTree(res.body());
            totalPages = root.get("total_pages").asInt();   // ★ 지도 갱신

            for (JsonNode item : root.get("data")) {
                double fat = item.get("fat").asDouble();    // 문자열로 와도 안전
                if (fat > maxFat) {                         // 동점 규칙은 지문 확인!
                    maxFat = fat;
                    best = item.get("name").asText();
                }
            }
            page++;
        }
        return best;
    }
}
```

필드명(`fat`→`score`→`price`)과 갱신식(max→sum→filter)만 바꾸면 이 유형 전체가 이 코드다.

---

## 3.5단계. 변형 — 키별(국가별) 집계 후 최대 ★실제 기출

실제로 만난 문제는 한 단계 더 있었다: **음식마다 칼로리 값이 있고, 국가별로 합산한 총량이 가장 큰 국가**를 찾는 형태.

**🤔 생각** — 3단계 템플릿은 "항목 하나의 최대"를 추적한다. 그런데 답의 단위가 항목(음식)이 아니라 **그룹(국가)**이면 무엇이 달라지나?

<details><summary>📖 추론 열기</summary>

max 변수 2개로는 부족하다 — 어떤 국가의 합계가 최종 1등일지는 **마지막 페이지를 읽기 전까지 모른다** (지금까지 꼴찌였던 국가가 마지막 페이지에서 역전할 수 있다). 그러므로:

> **순회 중에는 판단하지 말고 모으기만 한다.** `Map<국가, 합계>`에 누적 → 전 페이지 순회가 끝난 뒤 한 번에 argmax.

3단계(항목 max)와의 차이를 표로 박아두면 지문을 읽는 순간 갈 길이 보인다:

| 지문이 묻는 것 | 순회 중 상태 | 판단 시점 |
|---|---|---|
| 가장 높은 **항목**(음식) 하나 | max 변수 2개 | 순회 **중** 즉시 갱신 |
| 합계가 가장 높은 **그룹**(국가) | `Map<키, 합계>` | 순회가 **끝난 뒤** argmax |

공개 문제와의 관계: 인증 기출 *Total Goals by a Team*은 "주어진 한 팀"의 합산이라 Map조차 필요 없다. 기업 변형은 키를 안 정해주니 **전 키를 동시에 집계** — HashMap 하나 차이다.

</details>

**✅ 확인** — 3단계 코드에서 루프 안쪽과 반환부만 이렇게 바뀐다:

```java
Map<String, Double> totalByCountry = new HashMap<>();

// (페이지 루프 안) 판단하지 않고 누적만
for (JsonNode item : root.get("data")) {
    String country = item.get("country").asText();
    double cal = item.get("calories").asDouble();
    totalByCountry.merge(country, cal, Double::sum);   // 없으면 넣고, 있으면 더함
}

// (루프 종료 후) 이제야 argmax
String best = null; double max = -1;
for (Map.Entry<String, Double> e : totalByCountry.entrySet())
    if (e.getValue() > max) { max = e.getValue(); best = e.getKey(); }
return best;
```

`merge(key, v, Double::sum)` 한 줄이 "없으면 put, 있으면 더하기"를 대신한다 — SQL로 치면 `GROUP BY country` + `ORDER BY SUM(calories) DESC LIMIT 1`을 손으로 쓴 것.

**이 변형의 추가 함정**: ① 동점 국가 처리 — 지문에 "사전순으로 앞선 것" 류의 문장이 있으면 argmax 루프에서 `e.getValue() == max && e.getKey().compareTo(best) < 0` 분기 추가 ② HashMap 순회 순서는 무작위이므로 **동점 규칙 없이 == 방치하면 실행마다 답이 바뀔 수 있다** ③ 평균을 묻는 변형이면 합계와 개수를 함께 누적 (`Map<String, double[]>`).

---

## 4단계. ✅ 확인 — 제출 전 손 검증 시나리오

머릿속 시뮬레이션으로 3가지를 돌려본다:

1. **total_pages=1**인 작은 입력 → 루프 1회, 정상 종료?
2. **최댓값이 마지막 페이지**에 있는 입력 → 끝까지 돌아서 잡히나?
3. **조건에 맞는 항목이 0개** → `best`가 null/기본값일 때 반환 규칙은? (지문에 명시된 기본 반환값 확인 — 보통 빈 문자열이나 -1)

---

## 5단계. 함정 체크리스트 (이 유형의 배점은 전부 여기에 있다)

- [ ] **total_pages를 응답에서 읽어 갱신**했나 (오답 원인 1위)
- [ ] **동점(tie) 규칙** — "먼저 나온 것 유지"면 `>`, "나중 것"이면 `>=`. 지문의 한 문장이 답을 가른다
- [ ] **숫자가 문자열로 오는 경우** — `"fat": "32.1"`처럼 따옴표가 붙어 와도 `asDouble()`은 안전, `asInt()`+`getInt()` 혼용은 위험
- [ ] **null/누락 필드** — 일부 항목에 필드가 없으면 `item.has("fat")` 가드
- [ ] **URL 인코딩** — 도시명에 공백("New York") 있으면 `URLEncoder` 필수
- [ ] **page는 1부터** — 0부터 도는 실수 (jsonmock은 1-base)
- [ ] 반환 타입 — 이름을 달라는지, 값을 달라는지, 리스트를 달라는지 재확인

---

## 3단 요약 (암기)

- **① 결론 · WHAT** — REST API 코테는 알고리즘이 아니라 **"페이지 전부 순회 + 필드 하나 추적"** 체크리스트 문제다. 템플릿 하나로 전 문제를 덮는다.
- **② 원리 · HOW** — 첫 응답은 데이터가 아니라 **지도(total_pages)**다. `while (page <= totalPages)`로 전부 돌며, 반환 요구에 맞는 최소 상태만 들고 다닌다. 답의 단위가 **항목이면 순회 중 max 갱신**, **그룹(국가)이면 Map에 누적만 하고 순회가 끝난 뒤 argmax** — 판단 시점이 다르다.
- **③ 확장 · TRADE-OFF** — 점수는 코드가 아니라 **꼼꼼함**에서 갈린다: total_pages 갱신, 동점 규칙(> vs >=), 문자열 숫자, 빈 결과 기본값. 실무의 페이지네이션 API 소비(→ [웹 통신·API](../cs/web-communication.md))와 똑같은 근육이라, 이 유형은 연습 대비 수익률이 가장 높다.
