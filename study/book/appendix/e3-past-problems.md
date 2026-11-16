# 부록 E 면접과 코딩테스트 · E.3 기출 복기와 치트시트

> 부록

## 들어가며

이진 문자열 조합 개수, REST API 페이지네이션, 애너그램 쌍, 중복 없는 최장 부분문자열 같은 실제 기출과, 시험장에서 바로 쓰는 org.json 치트시트다.

### 한눈에 보기

```mermaid
flowchart LR
    J["0단계 판별<br/>무슨 유형인가"] --> T["생각 단계<br/>왜 단순한 방법이 막히나"]
    T --> C["결론<br/>코드"]
    C --> V["손으로 확인<br/>예제 추적"]
    V --> X["함정 체크리스트<br/>제출 직전"]
```

> 모든 기출 복기는 같은 순서로 쓰여 있다. 먼저 무슨 유형인지 판별하고, 단순한 방법이 왜 막히는지 생각한 뒤, 코드로 결론을 내고, 예제를 손으로 추적해 확인하고, 제출 직전 함정 체크리스트로 마무리한다.

---

## E.3.1 기출 복기 — 이진 문자열에서 만들 수 있는 서로 다른 조합의 개수

> 실전(HackerRank 계열)에서 만난 문제. 유형명: **Distinct Subsequences** (LeetCode 940 동형)
> **난이도**: HackerRank **Medium** (원형 LC 940은 Hard, 이진 축소판이라 한 단계 아래) · **기업 코테 3문제 세트 기준 2번 문제(중~중상)** — "나열하지 말고 세라"는 DP 전환을 스스로 떠올려야 해서 여기서 당락이 갈린다. 부록의 자르기 변형도 같은 급(LC 1593 Medium).

---

### 0단계. 문제 판별 — 겉모습이 같은 문제 4형제

`"01011011"` 같은 이진 문자열 문제는 **겉이 똑같고 속이 다르다.** 풀이를 시작하기 전에 무엇을 묻는지부터 확정해야 한다 (실제로 이 판별을 틀리면 트라이·백트래킹·DP 중 엉뚱한 걸 꺼내게 된다):

| 지문의 질문 | 문제 유형 | 알고리즘 |
|---|---|---|
| 여러 문자열 중 하나가 다른 것의 **접두사**면 안 된다 | No Prefix Set | 트라이 / 정렬 후 이웃 비교 |
| 한 문자열을 **연속으로 잘라** 서로 다른 조각 최대 몇 개? | Max Unique Split | 백트래킹 (→ 부록) |
| 글자를 **골라서(순서 유지)** 만들 수 있는 서로 다른 조합 개수? | **Distinct Subsequences** | **DP ← 이 노트** |
| 서로 다른 **연속 부분문자열**의 종류 수? | Count Distinct Substrings | HashSet 전수 / Suffix Automaton |

**판별 질문 3개**: ① 연속인가, 골라내기인가? ② 자르기(분할)인가, 세기인가? ③ "최대 개수"인가 "종류 수"인가?

> 이 문제의 지문 신호: "조합", "만들 수 있는", "서로 다른 ~의 개수" → 골라내기 + 종류 세기 = Distinct Subsequences.

---

### 1단계. 🤔 생각 — 전부 만들어서 Set에 넣으면 왜 안 되나?

*(코드부터 치지 말고 30초만 생각해 보기: n글자짜리 문자열의 부분수열은 몇 개나 되나?)*

<details><summary>📖 추론 열기</summary>

글자마다 "뽑는다/안 뽑는다" 두 갈래 → 부분수열은 최대 **2ⁿ개**다. 전부 생성해서 `HashSet`으로 중복 제거하는 순간 시간·메모리가 지수로 터진다.

여기서 나와야 하는 생각의 전환이 이 문제의 전부다:

> **"만들지 말고 세자."** 결과물을 나열할 수 없을 만큼 많다면, 개수만 굴려가는 방법 = DP의 신호다.

</details>

**✅ 확인**: n=60이면 2⁶⁰ ≈ 10¹⁸ — `long`이 겨우 담는 크기의 목록을 "나열"하는 건 불가능하다. 지문에 `mod 1,000,000,007`이 붙어 있다면 그것 자체가 "답이 지수적으로 크다 = 나열 금지"라는 출제자의 힌트다.

---

### 2단계. 🤔 생각 — 그냥 세면 중복은 어디서 생기나?

*(예시 `"010"`에서 "00"을 만들어 보기. 몇 가지 방법으로 만들 수 있나?)*

<details><summary>📖 추론 열기</summary>

`"010"`에서 "00"은 1번째+3번째 글자를 골라도, …사실 이 예에선 한 가지지만, `"00"`이라는 입력이면 앞의 0을 쓰든 뒤의 0을 쓰든 결과 `"0"`은 같다. 즉 —

> **중복의 정체 = "같은 결과 문자열, 다른 선택 경로".**
> 그러므로 "경로"를 세면 중복이고, **"결과"를 직접 세야** 한다.

결과(문자열)들을 셀 수 있으려면 분류 기준이 필요하다. 좋은 기준의 조건: 모든 결과가 정확히 한 칸에 들어가야 한다(빠짐없이, 겹침없이). 후보를 떠올려 보면 — 길이별? (칸이 n개라 상태 폭발) 첫 글자별? (새 글자가 뒤에 붙는 진행 방향과 안 맞음) …

> **마지막 글자별 분류**가 정답이다. 모든 결과는 `'0'`으로 끝나거나 `'1'`로 끝난다. 딱 두 칸. 그리고 문자열을 왼쪽부터 읽으며 "뒤에 글자를 붙이는" 진행 방향과 완벽히 맞는다.

</details>

**✅ 확인**: `end[0]` = '0'으로 끝나는 서로 다른 조합 수, `end[1]` = '1'로 끝나는 수 — 모든 비어있지 않은 조합은 이 둘 중 정확히 한 곳에 속한다. 분류가 완전함을 스스로 납득했는지 확인.

---

### 3단계. 🤔 생각 — 새 글자 하나가 들어오면 무슨 일이 일어나나?

*(지금까지 조합이 `end[0]`, `end[1]`개 있는데 새 글자 `'1'`이 왔다. 새로 생기는 것은? 사라지는 것은?)*

<details><summary>📖 추론 열기</summary>

새 글자 `c='1'`이 오면:

1. **기존의 모든 조합 뒤에 `1`을 붙인** 새 조합들이 생긴다 → `end[0] + end[1]`개, 전부 `1`로 끝남
2. **`"1"` 단독** 조합도 생긴다 → +1
3. 그런데 **예전부터 `1`로 끝나던 조합들**은? — 그 문자열들은 1번에서 만든 집합에 **전부 다시 들어있다** (같은 문자열 s에 대해, s가 예전에 만들어졌든 지금 "s의 앞부분 + 새 1"로 만들어졌든 **같은 결과**다)

그래서 점화식은 **더하기가 아니라 덮어쓰기**다:

```
end[c] ← end[0] + end[1] + 1     (기존 end[c]는 버림 — 이게 중복 제거)
```

> 덮어쓰기 = 중복 제거. 이 한 줄을 이해하면 이 유형은 끝난 것이다.

</details>

**✅ 확인 — 미니 예제 `"01"` 손 계산**: 시작 (0,0) → `'0'`: end[0]=0+0+1=1 → `'1'`: end[1]=1+0+1=2 → 총 3개. 실제 나열: `"0"`, `"1"`, `"01"` = 3개 ✓

---

### 4단계. 결론 — 코드 (Java)

추론이 끝났으니 코드는 5줄이다:

```java
static long countDistinct(String s) {
    final long MOD = 1_000_000_007L;
    long[] end = new long[2];                      // end[c] = 문자 c로 끝나는 서로 다른 조합 수
    for (char ch : s.toCharArray()) {
        int c = ch - '0';
        end[c] = (end[0] + end[1] + 1) % MOD;      // 덮어쓰기 = 중복 제거
    }
    return (end[0] + end[1]) % MOD;                // 빈 조합 제외 총합
}
```

O(n) 시간 · O(1) 공간. 알파벳이 소문자 전체라면 `end[26]`으로 같은 코드.

---

### 5단계. ✅ 전체 확인 — 기출 예제 `"01011011"` 손 추적

시험장에서도 이 표를 3분 안에 그려 검증할 수 있어야 한다:

| 읽은 문자 | end[0] | end[1] | 누적 총합 |
|---|---|---|---|
| 0 | 1 | 0 | 1 |
| 1 | 1 | 2 | 3 |
| 0 | **4** | 2 | 6 |
| 1 | 4 | **7** | 11 |
| 1 | 4 | **12** | 16 |
| 0 | **17** | 12 | 29 |
| 1 | 17 | **30** | 47 |
| 1 | 17 | **48** | **65** |

**답: 65.** (굵은 칸 = 그 턴에 덮어쓴 값. 매번 `이전 두 칸의 합 + 1`인지 눈으로 검산)

---

### 6단계. 함정 체크리스트 (제출 직전 확인)

- [ ] **mod 1,000,000,007** 붙였나 — 이 유형은 거의 항상 요구됨. 덧셈마다 `% MOD`
- [ ] **"숫자"로 세는 변형인가?** — `"01"`과 `"1"`을 숫자 1 하나로 치면 답이 다르다. 그 경우 **'1'로 시작하는 조합만 세고, '0'이 하나라도 있으면 값 0으로 +1**:

```java
// 숫자 값 기준 변형: '1'로만 시작 허용
if (c == 1) end[1] = (end[0] + end[1] + 1) % MOD;
else        end[0] = (end[0] + end[1]) % MOD;      // '0'은 단독 시작 불가(+1 없음)
// 답 = end[0] + end[1] + (s에 '0'이 있으면 1)
```

  같은 예제 `"01011011"` → 문자열 기준 **65** / 숫자 기준 **26**. **기대 출력이 어느 쪽인지로 문제 해석을 역확정**할 수 있다.
- [ ] 빈 조합 포함 여부 — 포함이면 +1
- [ ] 입력을 숫자로 파싱하지 않았나 — 앞자리 0이 있는 한 **끝까지 String**으로 다룬다

---

### 부록. 자매 문제 — "안 겹치게 최대 몇 조각으로 자르나" (Max Unique Split)

같은 이진 문자열로 나오는 다른 문제(0단계 표의 2행). 압축 버전으로 같은 순서 연습:

**🤔 생각**: `"01011011"`(8글자)을 서로 다른 조각으로 자를 때, 6조각이 가능한가?

<details><summary>📖 추론</summary>

1글자 조각은 `"0"`, `"1"` **2종류뿐**(이진의 특성). 6조각이면 최소 길이 합이 1+1+2+2+2+2 = 10 > 8 → 불가능. 5조각(1+1+2+2+2 = 8)이 상한이고, `0 | 1 | 01 | 10 | 11`로 실제 달성된다. 이런 **개수 상한 계산**이 백트래킹 전에 답의 감을 잡아준다.

</details>

```java
static int best = 0;
static void dfs(String s, int pos, Set<String> used) {
    if (used.size() + (s.length() - pos) <= best) return;   // 가지치기
    if (pos == s.length()) { best = Math.max(best, used.size()); return; }
    for (int end = pos + 1; end <= s.length(); end++) {
        String piece = s.substring(pos, end);
        if (used.add(piece)) { dfs(s, end, used); used.remove(piece); }
    }
}
```

**✅ 확인**: `"01011011"` → 5. (자르기 = 백트래킹 / 조합 세기 = endsWith DP — 판별이 반이다)

---

### 3단 요약 (암기)

- **① 결론 · WHAT** — 이진 문자열의 서로 다른 부분수열 개수는 `end[c] = end[0]+end[1]+1` **덮어쓰기 DP**로 O(n)에 센다.
- **② 원리 · HOW** — 결과를 **마지막 글자로 분류**하면 두 칸으로 완전 분할되고, 새 글자가 올 때 "기존 전부+새 글자"가 예전의 같은-끝 조합들을 **포함**하므로 더하지 않고 덮어쓴다 — 덮어쓰기가 곧 중복 제거다.
- **③ 확장 · TRADE-OFF** — 나열(2ⁿ)은 불가능하므로 지문의 `mod 1e9+7`이 DP 신호다. 함정은 "문자열로 세나 숫자로 세나"(65 vs 26) — 기대 출력으로 역확정하라. 자르기 변형이면 DP가 아니라 백트래킹이다.

---

## E.3.2 기출 복기 — REST API 페이지네이션 문제 (특정 필드 최댓값 찾기)

> 실전(HackerRank REST API 인증·기업 코테)에서 만난 유형. "fat이 최고인 항목", "평점 최고 식당", "총 골 수" 전부 **같은 템플릿 하나**다.
> **난이도**: HackerRank **REST API Intermediate 인증** 급 (알고리즘으로 치면 Easy~Medium) · **기업 코테 기준 1번 워밍업~2번(하~중)** — 사고력이 아니라 꼼꼼함 시험이라 **준비한 사람에겐 공짜 점수, 안 한 사람에겐 0점**인 극단적 분포. 그룹 집계 변형(§3.5)까지 오면 2번 문제(중) 수준.
> 진행 방식은 이진 조합 노트와 동일 — **🤔 생각 → 📖 읽기 → ✅ 확인** 순서로.

---

### 0단계. 문제 판별 — 이건 알고리즘 문제가 아니다

REST API 문제의 정체를 먼저 확정한다:

> **알고리즘 난이도 = 최하 (max 추적이 전부). 진짜 시험 대상 = HTTP 호출·JSON 파싱·페이지네이션을 실수 없이 하는가.**

즉 "머리 쓰는 문제"가 아니라 "**빠뜨리면 0점 나는 체크리스트 문제**"다. 형태는 항상 이렇다:

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

### 1단계. 🤔 생각 — 왜 이 문제의 오답 1위가 "한 페이지만 처리"인가?

*(위 응답 예시를 다시 보라. data에 10개가 왔다. 답을 내도 되나?)*

<details><summary>📖 추론 열기</summary>

`total=27`인데 `data`에는 10개뿐 — **나머지 17개는 2, 3페이지에 있다.** 최댓값이 3페이지에 숨어 있으면 1페이지만 본 코드는 그럴듯한 오답을 낸다(테스트케이스 일부는 통과해서 더 위험하다).

그래서 이 유형의 뼈대 사고는 하나다:

> **"첫 응답은 데이터가 아니라 지도다."** 첫 호출에서 `total_pages`를 읽고, 1부터 total_pages까지 **전부 순회**해야 데이터를 다 본 것이다.

</details>

**✅ 확인**: 내 루프가 `while (page <= totalPages)` 꼴이고, `totalPages`가 **응답에서 갱신**되는지(하드코딩 아님) 확인. `data`가 빈 배열인 페이지가 와도 죽지 않는지도.

---

### 2단계. 🤔 생각 — 순회하면서 무엇을 들고 다녀야 하나?

*(27개 항목을 List에 다 모아서 마지막에 정렬해야 하나?)*

<details><summary>📖 추론 열기</summary>

전부 모을 필요가 없다. 묻는 건 "최대 하나"뿐이므로 —

> **지금까지의 최댓값과 그 주인, 변수 2개**면 끝이다. 스트리밍으로 페이지를 읽어 버리면서 `max`만 갱신한다.

이건 이진 조합 노트 1단계와 같은 전환이다: "다 만들어 놓고 고르기"가 아니라 **"지나가면서 세기/고르기"**. 합계형 문제(total goals)면 변수 1개(sum), 목록형 문제(조건 만족 이름 전부)일 때만 List에 모은다 — **지문이 뭘 반환하라는지가 자료구조를 정한다.**

</details>

**✅ 확인**: 내 코드에 페이지 전체를 담는 컬렉션이 없는지(최댓값 문제라면 불필요), 갱신 조건이 지문의 동점 규칙과 맞는지(5단계에서 재확인).

---

### 3단계. 결론 — 만능 템플릿 (Java 11+ HttpClient)

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

> 📦 **import 현황 정리**: HTTP는 `java.net.http.HttpClient`로 **순수 자바(표준, Java 11+)**. JSON만 서드파티가 필요한데, **자바 표준엔 JSON 파서가 없기 때문**이다(JEP 198이 끝내 채택 안 됨). HackerRank엔 **org.json · Jackson · Gson이 사전 설치**돼 있어 pom/gradle 없이 import만 하면 된다. 참고로 알고리즘 노트 3개(조합·애너그램·윈도우)는 `java.util`까지만 쓰는 100% 표준 라이브러리다.

#### 대안 파싱 — org.json (실전 검증됨, 가장 단순)

Jackson 대신 `org.json`을 쓰면 위 템플릿의 파싱부만 이렇게 바뀐다:

```java
import org.json.*;                            // HackerRank 사전 설치 — 이 한 줄이면 끝

JSONObject root = new JSONObject(res.body());
totalPages = root.getInt("total_pages");
JSONArray data = root.getJSONArray("data");
for (int i = 0; i < data.length(); i++) {     // ⚠️ size() 아니고 length()
    JSONObject item = data.getJSONObject(i);
    double fat = item.optDouble("fat", -1);   // ★ opt* = 키 누락 시 예외 대신 기본값
    String name = item.getString("name");
    if (fat > maxFat) { maxFat = fat; best = name; }
}
```

org.json만의 함정: ① `get*`은 키가 없으면 **JSONException** — 안전하게는 `opt*` 계열 ② `JSONArray.length()` (size 아님) ③ `optDouble`은 `"32.1"` 같은 문자열 숫자도 자동 변환.

🔎 **API 표면 전체 암기용 →** org.json 치트시트 (7줄 최소 세트 · get vs opt · 예외 3종 디버깅 순서)

---

### 3.5단계. 변형 — 키별(국가별) 집계 후 최대 ★실제 기출

실제로 만난 문제는 한 단계 더 있었다: **음식마다 칼로리 값이 있고, 국가별로 합산한 총량이 가장 큰 국가**를 찾는 형태.

**🤔 생각** — 3단계 템플릿은 "항목 하나의 최대"를 추적한다. 그런데 답의 단위가 항목(음식)이 아니라 **그룹**(국가)이면 무엇이 달라지나?

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

### 4단계. ✅ 확인 — 제출 전 손 검증 시나리오

머릿속 시뮬레이션으로 3가지를 돌려본다:

1. **total_pages=1**인 작은 입력 → 루프 1회, 정상 종료?
2. **최댓값이 마지막 페이지**에 있는 입력 → 끝까지 돌아서 잡히나?
3. **조건에 맞는 항목이 0개** → `best`가 null/기본값일 때 반환 규칙은? (지문에 명시된 기본 반환값 확인 — 보통 빈 문자열이나 -1)

---

### 5단계. 함정 체크리스트 (이 유형의 배점은 전부 여기에 있다)

- [ ] **정규식으로 JSON 파싱을 시도하지 않았나** — JSON은 중첩·재귀 구조라 정규식(정규 언어)으로는 **원리적으로** 못 다룬다. 필드 순서 변경·중첩 객체·문자열 안의 특수문자에서 반드시 깨진다. 파서(org.json/Jackson/Gson)로 갈 것 — 시험장 시간을 녹이는 1순위 지뢰
- [ ] **total_pages를 응답에서 읽어 갱신**했나 (오답 원인 1위)
- [ ] **동점(tie) 규칙** — "먼저 나온 것 유지"면 `>`, "나중 것"이면 `>=`. 지문의 한 문장이 답을 가른다
- [ ] **숫자가 문자열로 오는 경우** — `"fat": "32.1"`처럼 따옴표가 붙어 와도 `asDouble()`은 안전, `asInt()`+`getInt()` 혼용은 위험
- [ ] **null/누락 필드** — 일부 항목에 필드가 없으면 `item.has("fat")` 가드
- [ ] **URL 인코딩** — 도시명에 공백("New York") 있으면 `URLEncoder` 필수
- [ ] **page는 1부터** — 0부터 도는 실수 (jsonmock은 1-base)
- [ ] 반환 타입 — 이름을 달라는지, 값을 달라는지, 리스트를 달라는지 재확인

---

### 3단 요약 (암기)

- **① 결론 · WHAT** — REST API 코테는 알고리즘이 아니라 **"페이지 전부 순회 + 필드 하나 추적"** 체크리스트 문제다. 템플릿 하나로 전 문제를 덮는다.
- **② 원리 · HOW** — 첫 응답은 데이터가 아니라 **지도**(total_pages)다. `while (page <= totalPages)`로 전부 돌며, 반환 요구에 맞는 최소 상태만 들고 다닌다. 답의 단위가 **항목이면 순회 중 max 갱신**, **그룹(국가)이면 Map에 누적만 하고 순회가 끝난 뒤 argmax** — 판단 시점이 다르다.
- **③ 확장 · TRADE-OFF** — 점수는 코드가 아니라 **꼼꼼함**에서 갈린다: total_pages 갱신, 동점 규칙(> vs >=), 문자열 숫자, 빈 결과 기본값. 실무의 페이지네이션 API 소비(→ 웹 통신·API)와 똑같은 근육이라, 이 유형은 연습 대비 수익률이 가장 높다.

---

## E.3.3 유형 훈련 — Sherlock and Anagrams (애너그램 쌍 세기)

> HackerRank 실제 공개 문제 (Interview Preparation Kit · Dictionaries and Hashmaps).
> **난이도**: HackerRank **Medium** · **기업 코테 3문제 세트 기준 2번(중)** — 이진 조합 노트와 같은 급이며, 같은 사고("직접 나열하지 말고 분류해서 세라")를 해시로 연습하는 최적의 자매 문제라 선정.
> 진행: **🤔 생각 → 📖 읽기 → ✅ 확인** 순서.

---

### 0단계. 문제 판별

> 문자열 s의 **부분문자열 쌍** 중, 서로 **애너그램**(글자 구성이 같음)인 쌍의 개수를 구하라.
> 예: `"abba"` → `[a,a]`, `[b,b]`, `[ab,ba]`, `[abb,bba]` = **4쌍**

지문 신호: "쌍의 개수" + "애너그램/구성이 같은" → **그룹핑 후 조합 세기**. (최장/최대를 묻지 않음 — DP·투포인터 아님)

---

### 1단계. 🤔 생각 — 쌍을 직접 비교하면 왜 아까운가?

*(부분문자열이 k개면 쌍은 몇 개인가? 각 쌍 비교 비용은?)*

<details><summary>📖 추론 열기</summary>

n=100이면 부분문자열은 약 5,050개, 쌍은 약 1,270만 개 — 쌍마다 애너그램 검사까지 하면 낭비가 크다. 그리고 더 중요한 통찰:

> **쌍은 세는 대상이 아니라 계산되는 결과다.** 애너그램인 것들끼리 한 그룹으로 모으면, 그룹 크기가 c일 때 쌍의 수는 **c(c-1)/2**로 그냥 나온다.

이진 조합 노트 2단계와 같은 구조다 — 거기선 "경로 말고 결과"를 셌고, 여기선 "쌍 말고 그룹"을 센다. **개별 관계를 열거하지 말고, 같은 것끼리 묶은 뒤 공식으로 닫는다.**

</details>

**✅ 확인**: `c=2`면 1쌍, `c=3`이면 3쌍, `c=4`면 6쌍 — 손가락으로 세서 공식과 일치하는지 확인.

---

### 2단계. 🤔 생각 — "애너그램인 것끼리 같은 그룹"을 어떻게 만드나?

*(HashMap의 키로 무엇을 넣어야 "ab"와 "ba"가 한 칸에 모이나?)*

<details><summary>📖 추론 열기</summary>

애너그램의 정의 = **정렬하면 같은 문자열**. 그러므로 —

> **정규화 키**: 부분문자열을 **정렬한 결과**를 키로 쓰면 애너그램들이 자동으로 한 칸에 쌓인다. (`"ab"`도 `"ba"`도 키는 `"ab"`)

대안 키는 문자 개수 배열(`int[26]`을 문자열화) — 부분문자열이 길면 정렬 O(L log L) 대신 O(L)로 더 싸다. n≤100인 이 문제에선 어느 쪽이든 통과.

</details>

**✅ 확인**: `"abba"`의 길이-2 부분문자열 `ab, bb, ba` → 키는 `ab, bb, ab` → 그룹 {ab: 2, bb: 1} → 쌍 1 + 0. 길이-1 `a,b,b,a` → {a:2, b:2} → 1+1. 길이-3 `abb, bba` → 키 둘 다 `abb` → 1쌍. **총 4** ✓ (문제 예시와 일치)

---

### 3단계. 결론 — 코드 (Java)

```java
static long sherlockAnagrams(String s) {
    Map<String, Integer> group = new HashMap<>();
    int n = s.length();
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j <= n; j++) {
            char[] c = s.substring(i, j).toCharArray();
            Arrays.sort(c);                              // 정규화
            group.merge(new String(c), 1, Integer::sum); // 그룹에 쌓기
        }
    long pairs = 0;
    for (int c : group.values())
        pairs += (long) c * (c - 1) / 2;                 // 그룹 → 쌍 공식
    return pairs;
}
```

`merge(...)` 누적 → 마지막에 공식 — REST API 노트 §3.5의 "순회 중엔 모으기만, 끝나고 계산"과 같은 뼈대다.

---

### 4단계. ✅ 전체 확인 — 알려진 테스트값

| 입력 | 답 | 손 검산 포인트 |
|---|---|---|
| `abba` | 4 | 2단계에서 직접 셈 |
| `kkkk` | 10 | 길이1: C(4,2)=6 · 길이2: C(3,2)=3 · 길이3: C(2,2)=1 |
| `abcd` | 0 | 전부 다른 구성 — 그룹 크기 전부 1 |

---

### 5단계. 함정 체크리스트

- [ ] 쌍 수는 **long** — c가 커지면 `c*(c-1)/2`가 int를 넘는다 (`(long)` 캐스팅 위치 주의)
- [ ] `substring(i, j)`의 j는 **exclusive** — 루프 경계 `j <= n`
- [ ] 같은 위치 문자열이라도 **위치가 다르면 다른 부분문자열** — 중복 제거하면 안 됨 (Set 쓰면 오답)
- [ ] 테스트케이스가 여러 개(T개) 오는 입력 형식 — 바깥 루프 잊지 말기

---

### 3단 요약 (암기)

- **① 결론 · WHAT** — 애너그램 쌍 개수 = 부분문자열을 **정렬해 정규화한 키**로 그룹핑한 뒤, 그룹마다 **c(c-1)/2** 합산.
- **② 원리 · HOW** — 쌍을 직접 비교하지 않는다. "같은 것"의 정의(애너그램=정렬 결과 동일)를 **키 함수**로 바꾸면 HashMap이 그룹핑을 공짜로 해주고, 쌍은 조합 공식으로 닫힌다.
- **③ 확장 · TRADE-OFF** — 정규화 키 발상은 범용이다: 애너그램 그룹(LC 49), 회문 구성 가능 검사, 좌표 정규화까지. 부분문자열이 길어지면 정렬 키 대신 **카운트 배열 키**(O(L))로 갈아탄다. n이 크면(10⁵급) 부분문자열 전수 자체가 불가 — 그때는 다른 문제다(롤링 해시 영역).

---

## E.3.4 유형 훈련 — 중복 없는 가장 긴 부분문자열 (슬라이딩 윈도우)

> LeetCode 3 동형 · HackerRank 기업 코테 최다 빈출 유형 중 하나.
> **난이도**: **Medium** · **기업 코테 3문제 세트 기준 1~2번(중)** — 슬라이딩 윈도우의 대표 관문 문제라, 이거 하나로 로드맵 D8 유형 전체의 사고를 훈련할 수 있어 선정.
> 진행: **🤔 생각 → 📖 읽기 → ✅ 확인** 순서.

---

### 0단계. 문제 판별

> 문자열 s에서 **같은 문자가 두 번 나오지 않는 가장 긴 연속 부분문자열**의 길이를 구하라.
> 예: `"pwwkew"` → `"wke"` = **3**

지문 신호: "**연속** 구간" + "조건을 만족하는 **최장/최단**" → 슬라이딩 윈도우. (연속이 아니면 부분수열 문제 — 이진 조합 노트 0단계 판별표의 그 갈림길)

---

### 1단계. 🤔 생각 — 모든 시작점에서 뻗어보면(O(n²)) 무엇을 낭비하나?

*(시작점 i에서 중복이 날 때까지 갔다가, i+1에서 다시 처음부터 뻗는다. 뭐가 아까운가?)*

<details><summary>📖 추론 열기</summary>

i에서 j까지 중복이 없었다는 사실은 **i+1에서 j까지도 중복이 없다**는 뜻이다 — 그런데 O(n²) 풀이는 이 정보를 버리고 다시 검사한다.

> 슬라이딩 윈도우의 본질: **"창 안에는 중복이 없다"는 불변식(invariant)을 유지**하면서, 오른쪽은 매 턴 1칸 전진, 왼쪽은 불변식이 깨질 때만 필요한 만큼 전진. 양쪽 포인터가 각각 최대 n번만 움직이므로 O(n).

그럼 왼쪽을 "필요한 만큼"이 정확히 어디까지인가? — 새 문자 c가 중복을 만들었다면, **c가 마지막으로 나온 위치 + 1**까지. 그 위치를 즉시 알려면 `last[문자] = 마지막 등장 인덱스` 배열 하나면 된다 (한 칸씩 밀며 찾을 필요 없이 점프).

</details>

**✅ 확인**: 불변식 문장을 스스로 말해보기 — "루프의 매 턴이 끝날 때, `s[left..r]` 안에는 중복 문자가 없다." 이 문장이 곧 답의 후보(`r - left + 1`)가 항상 유효한 이유다.

---

### 2단계. 🤔 생각 — left가 뒤로 돌아가면 무슨 일이 생기나?

*(`"abba"`를 손으로 밀어보라. 두 번째 `a`(index 3)에서 `last['a']=0`인데, left를 0+1=1로 "당기면" 되나? 이미 left=2인데?)*

<details><summary>📖 추론 열기</summary>

`"abba"` 추적: 두 번째 `b`(index 2)에서 left는 2로 전진했다. 그다음 `a`(index 3)의 `last['a']=0` — 이걸 그대로 쓰면 left가 2→1로 **후퇴**하고, 창 `"bba"`는 중복을 품은 채 정답 후보가 돼버린다.

> 함정의 정체: `last[c]`가 **이미 창 밖**(left보다 왼쪽)이면 그 중복은 창과 무관하다. 그래서 갱신식은 —
> `left = max(left, last[c] + 1)` — 왼쪽 포인터는 절대 후퇴하지 않는다.

이 max 한 번이 이 문제 오답의 90%를 가른다.

</details>

**✅ 확인**: `"abba"` → 답 2 (`"ab"` 또는 `"ba"`). max 없이 돌리면 3이 나온다 — 틀린 코드가 어떤 값을 뱉는지까지 알아두면 시험장에서 자가진단이 된다.

---

### 3단계. 결론 — 코드 (Java)

```java
static int longestUnique(String s) {
    int[] last = new int[128];          // ASCII 전제. 유니코드면 HashMap<Character,Integer>
    Arrays.fill(last, -1);
    int best = 0, left = 0;
    for (int r = 0; r < s.length(); r++) {
        char c = s.charAt(r);
        if (last[c] >= left) left = last[c] + 1;   // max(left, last+1)와 동일 — 후퇴 금지
        last[c] = r;
        best = Math.max(best, r - left + 1);
    }
    return best;
}
```

O(n) 시간 · O(1) 공간(알파벳 크기 고정).

---

### 4단계. ✅ 전체 확인 — `"pwwkew"` 손 추적

| r | 문자 | last[c] ≥ left? | left | 창 | 길이 | best |
|---|---|---|---|---|---|---|
| 0 | p | ✗ | 0 | p | 1 | 1 |
| 1 | w | ✗ | 0 | pw | 2 | 2 |
| 2 | w | ✓(1≥0) | 2 | w | 1 | 2 |
| 3 | k | ✗ | 2 | wk | 2 | 2 |
| 4 | e | ✗ | 2 | wke | 3 | **3** |
| 5 | w | ✓(2≥2) | 3 | kew | 3 | 3 |

**답: 3** ✓ · `"abba"`도 같은 표로 그려서 2가 나오는지 검산.

---

### 5단계. 함정 체크리스트

- [ ] `left = max(left, last[c]+1)` — max 빠뜨리면 `"abba"`류에서 오답 (2단계)
- [ ] `last` 갱신은 left 조정 **후에** — 순서 바꾸면 자기 자신과 충돌
- [ ] 빈 문자열 → 0 반환되는지 (루프 안 돌아도 best=0 ✓)
- [ ] 문자 범위 — 소문자만이라 명시되면 `int[26]`, 아니면 `int[128]`, 한글·유니코드면 HashMap
- [ ] "길이"를 묻나 "문자열 자체"를 묻나 — 후자면 best 갱신 때 시작 인덱스도 저장

---

### 3단 요약 (암기)

- **① 결론 · WHAT** — 조건("중복 없음")을 만족하는 최장 **연속** 구간은 슬라이딩 윈도우 O(n): 오른쪽은 매 턴 전진, 왼쪽은 `max(left, last[c]+1)`로만 전진.
- **② 원리 · HOW** — "창 안엔 중복 없음"이라는 **불변식**을 매 턴 복구하는 구조. `last[]` 배열이 "왼쪽을 어디까지 당길지"를 O(1)에 알려주고, max가 창 밖의 낡은 등장 기록을 무시하게 해 후퇴를 막는다.
- **③ 확장 · TRADE-OFF** — 같은 뼈대로 "합이 k 이하인 최장 구간", "서로 다른 문자 k종 이하"(창 상태만 카운터 Map으로 교체) 등이 전부 풀린다. 단 **불변식이 단조가 아닌 문제**(창을 넓혀도 좁혀도 조건이 오락가락)에는 윈도우가 성립하지 않는다 — 그때는 투포인터가 아니라 다른 도구(이분탐색·DP)다.

---

## E.3.5 치트시트 — org.json 시험장 암기 세트

> REST API 유형을 풀 때 **외우고 들어가야 하는 API 표면 전부**. 시험 전날 이 한 장만 다시 볼 것.
> 실전 배경: 정규식 파싱 시도로 시간을 잃은 경험에서 나온 정리 — **파서 API를 손가락이 기억하면 그 시간이 통째로 돌아온다.**

---

### E.3.5.0 최소 암기 세트 — 이 7개면 문제가 풀린다

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

### E.3.5.1 get vs opt — 이 구분이 예외 지옥을 가른다

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

### E.3.5.2 JSONArray — 헷갈리는 것만

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

### E.3.5.3 중첩 접근 — 한 줄 체이닝

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

### E.3.5.4 출력을 JSON으로 내야 할 때 (드물지만 나옴)

```java
JSONObject out = new JSONObject();
out.put("name", best);                 // put은 체이닝 가능
out.put("total", maxFat);
System.out.println(out.toString());    // {"name":"...","total":...}
```

---

### E.3.5.5 예외 시나리오 3개 — 시험장 디버깅 순서

| 증상 | 원인 | 수정 |
|---|---|---|
| `JSONObject["fat"] not found` | 키 누락 항목 존재 | `get` → `opt`로 교체 |
| `JSONObject["name"] not a string` | 타입 불일치 (숫자를 getString) | `optString` (강제 변환) |
| `A JSONObject text must begin with '{'` | 응답이 JSON이 아님 — 에러 HTML, 빈 문자열, 또는 배열(`[`)로 시작 | `res.body()` 먼저 출력해 눈으로 확인 / 배열이면 `new JSONArray(body)` |

세 번째가 의외로 흔하다 — **파싱 코드를 의심하기 전에 body를 한 번 찍어봐라.** 5초짜리 확인이 30분을 아낀다.

---

### E.3.5.6 Jackson 미니 대조표 (보일러플레이트가 Jackson으로 온 경우)

문제 템플릿이 Jackson(`ObjectMapper`)을 이미 import한 채 주어지면 갈아타지 말고 그대로:

| 하려는 것 | org.json | Jackson |
|---|---|---|
| 진입 | `new JSONObject(body)` | `om.readTree(body)` → `JsonNode` |
| 정수 필드 | `root.getInt("k")` | `root.get("k").asInt()` |
| 배열 순회 | `for (i < arr.length())` | `for (JsonNode n : root.get("data"))` |
| 안전 접근 | `optDouble("k", -1)` | `root.path("k").asDouble(-1)` (`path`는 없어도 안 터짐) |

암기 부담을 줄이는 규칙: **org.json은 opt가 안전, Jackson은 path가 안전.**

---

### 🤔 자가 테스트 (답은 위에서 찾기)

1. 배열 크기는 `size()`인가 `length()`인가?
2. `"fat": "32.1"`(문자열)을 double로 읽는 가장 안전한 호출은?
3. `total_pages`를 읽을 때 get과 opt 중 뭐가 맞고, 왜?
4. `A JSONObject text must begin with '{'` 예외 — 코드 고치기 전에 먼저 할 일은?
5. Jackson에서 org.json의 `opt*`에 해당하는 안전 접근자는?

---

### 3단 요약 (암기)

- **① 결론 · WHAT** — org.json은 **진입 1개(`new JSONObject`) + 읽기 2계열(get/opt) + 배열 3개**(`length`·`getJSONObject`·순회)가 전부다. 0단계의 7줄이 시험장 최소 세트.
- **② 원리 · HOW** — get은 "없으면 터져야 하는 구조 필드"용, opt는 "있을 수도 없을 수도 있는 데이터 필드"용 — 예외 설계 철학이 이름에 박혀 있다. 강제 변환(`optDouble`의 문자열 숫자, `optString`의 만능 toString)이 지저분한 실전 응답을 흡수한다.
- **③ 확장 · TRADE-OFF** — org.json은 단순한 대신 POJO 매핑이 없다(그건 Jackson/Gson의 영역 — Spring에서 매일 쓰는 그쪽). 코테처럼 "필드 몇 개 뽑기"엔 org.json이 가장 빠르고, 응답 전체를 객체로 다뤄야 하면 Jackson `readValue`로 넘어간다. 어느 쪽이든 **정규식은 후보가 아니다** — JSON은 중첩 구조라 정규식의 표현력 밖이다.

---

## 함께 보기

- [8장 통신](../part2/ch08-communication.md)
- [E.2 코딩테스트 2주 압축](e2-coding-test-2week.md)

---

## 다음으로

마지막 절은 유형별 훈련이다.

👉 [부록 E 면접과 코딩테스트 · E.4 유형 훈련](e4-pattern-drills.md)
