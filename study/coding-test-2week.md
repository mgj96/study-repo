# 코딩테스트 2주 압축 로드맵 (Java · HackerRank 기준)

> 대상: 배열·정렬까지는 아는 기초 수준 / 목표: 코딩테스트 통과 실력 + 기본기 재정비
> 기준 플랫폼: HackerRank · 언어: Java
> 관련: [학습 로드맵](roadmap.md) · [백엔드 심화 로드맵](backend-roadmap.md) · [자바로 보는 자료구조](cs/data-structures-java.md) · [Q&A 자료구조·알고리즘](cs/qna/ds-algorithm.md) · [Java 타입/박싱](lang/java/types-boxing.md)

---

## 0. import 써도 되나?

**써도 됩니다. 제한 없습니다.**

- HackerRank 실행환경은 표준 라이브러리 import를 전부 허용합니다.
- 오히려 HackerRank가 제공하는 Java 문제 **보일러플레이트 자체가** 이렇게 시작합니다:

```java
import java.io.*;
import java.util.*;
import java.util.stream.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        // ...
    }
}
```

- `java.util.*`(List, Map, Set, Deque, PriorityQueue, Arrays, Collections), `java.io.*`, `java.util.stream.*` 모두 정상 사용 가능
- 외부 라이브러리(Gson, Apache Commons 등)도 일부 사전설치되어 있지만 **알고리즘 문제에서는 쓸 일 없습니다**

**"순수 Java"의 실전적 의미는 이것입니다:**

| 구분 | 판단 |
|---|---|
| `java.util` 자료구조 사용 | ✅ 당연히 사용. 안 쓰면 오히려 시간 낭비 |
| `Arrays.sort()`, `Collections.sort()` | ✅ 사용. 정렬을 직접 구현하는 건 학습용일 때만 |
| 자료구조 직접 구현(LinkedList, Stack 등) | ⚠️ **학습 목적일 때 1회만**. 실전에서는 내장 사용 |
| 외부 라이브러리 | ❌ 알고리즘 문제엔 불필요 |

> **결론: import 걱정 말고, 대신 `java.util`을 무기로 쓸 줄 아는 데 시간을 쓰세요.** 그게 이 로드맵 1주차의 핵심입니다.

### 언어 버전 선택

| 버전 | 메모리 | 권장도 |
|---|---|---|
| Java 8 (OpenJDK 8) | 512MB | **기본 권장** — 모든 문제 보일러플레이트가 이 기준 |
| Java 15 / 17 / 21 | 2048MB (17/21) | `var`, record 쓰고 싶거나 메모리 빡셀 때 |

시간 제한은 전 버전 공통 **4초**입니다. 넉넉해 보이지만 `Scanner`를 쓰면 이게 모자랍니다(→ 아래 D0 참조).

---

## D0. 시작 전 30분 세팅 (건너뛰지 말 것)

### ① 입출력 템플릿 하나 외우기

`Scanner`는 대용량 입력에서 **10배 이상 느립니다**. 시간초과의 가장 흔한 원인입니다.

```java
import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();

        int n = Integer.parseInt(br.readLine().trim());

        StringTokenizer st = new StringTokenizer(br.readLine());
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = Integer.parseInt(st.nextToken());

        // ... 풀이 ...

        sb.append(answer).append('\n');
        System.out.print(sb);   // 출력도 모아서 한 번에
    }
}
```

**검증:** 이 템플릿을 보지 않고 3분 안에 타이핑할 수 있으면 통과.

### ② 시간복잡도 감각 (4초 / 1억 연산 기준)

| n 범위 | 허용 복잡도 | 떠올릴 것 |
|---|---|---|
| n ≤ 20 | O(2ⁿ), O(n!) | 완전탐색, 백트래킹 |
| n ≤ 1,000 | O(n²) | 2중 반복문 OK |
| n ≤ 100,000 | O(n log n) | 정렬, 이분탐색, 우선순위큐 |
| n ≤ 1,000,000 | O(n) | 해시맵, 투포인터, 누적합 |

**검증:** 문제를 읽고 제약조건 n을 본 순간, 코드 짜기 전에 "이건 O(n log n)이어야 한다"가 먼저 나오면 통과.

---

## 1주차 — 무기 장착 (자료구조를 손에 붙이기)

### D1. Java 자료구조 매핑표 암기 + 배열 워밍업

**핵심: "이 문제엔 뭘 쓰지?"를 고민하는 시간을 0으로 만든다.**

| 필요한 것 | Java 클래스 | 핵심 메서드 |
|---|---|---|
| 가변 배열 | `ArrayList<Integer>` | `add / get / size / remove(idx)` |
| 중복 제거·존재 확인 | `HashSet<Integer>` | `add / contains / remove` |
| 개수 세기·매핑 | `HashMap<K,V>` | `put / get / getOrDefault / merge` |
| 스택 | `ArrayDeque<Integer>` | `push / pop / peek` |
| 큐 (BFS) | `ArrayDeque<Integer>` | `offer / poll / peek` |
| 최소/최대 힙 | `PriorityQueue<Integer>` | `offer / poll / peek` |
| 정렬된 맵/셋 | `TreeMap` / `TreeSet` | `firstKey / floorKey / ceilingKey` |

> ⚠️ `Stack`, `Vector`는 레거시(동기화 오버헤드). **`ArrayDeque`로 통일하세요.**

**개수 세기 관용구 — 이건 통째로 외웁니다:**
```java
map.put(x, map.getOrDefault(x, 0) + 1);   // 또는
map.merge(x, 1, Integer::sum);
```

**문제 (Warm-up):** Sock Merchant / Counting Valleys / Repeated String / Jumping on the Clouds

**검증:** 4문제 모두 통과 + 각 문제에서 쓴 자료구조를 한 줄로 설명 가능

---

### D2. 해시맵 집중 (코딩테스트 최빈출 1위)

O(n²) 완전탐색을 O(n)으로 바꾸는 기술. **"이미 본 것을 기억한다"** 패턴.

```java
// Two Sum 패턴 — 이 형태를 뼈대로 기억
Map<Integer, Integer> seen = new HashMap<>();
for (int i = 0; i < n; i++) {
    int need = target - a[i];
    if (seen.containsKey(need)) return new int[]{seen.get(need), i};
    seen.put(a[i], i);
}
```

**문제:** Hash Tables: Ransom Note / Two Strings / Sherlock and Anagrams / Frequency Queries

**검증:** Frequency Queries를 시간초과 없이 통과 (여기서 `HashMap` 두 개를 동시에 굴리는 감이 잡힙니다)

---

### D3. 정렬 + Comparator (Java 특화 함정 구간)

라이브러리 정렬을 **쓰는 법**이 핵심입니다. 직접 구현은 D3 마지막 30분에 버블/머지 한 번씩만.

```java
// 1) 객체 정렬
Arrays.sort(arr, (x, y) -> x.price - y.price);              // 오버플로 위험!
Arrays.sort(arr, Comparator.comparingInt(o -> o.price));    // 이게 안전

// 2) 다중 기준 (1순위 점수 내림차순, 2순위 이름 오름차순)
list.sort(Comparator.comparingInt(P::getScore).reversed()
                    .thenComparing(P::getName));

// 3) int[] 내림차순은 안 됩니다 → Integer[]로 박싱하거나 정렬 후 뒤집기
Integer[] boxed = Arrays.stream(a).boxed().toArray(Integer[]::new);
Arrays.sort(boxed, Comparator.reverseOrder());
```

> ⚠️ **`Arrays.sort(int[], Comparator)` 오버로드는 존재하지 않습니다.** 기초 단계에서 가장 많이 막히는 지점입니다.

**문제:** Sorting: Comparator / Mark and Toys / Fraudulent Activity Notifications

**검증:** Comparator를 람다로 즉석에서 작성 가능 + 다중 기준 정렬을 검색 없이 작성

---

### D4. 문자열 처리

```java
String s = "abc";
char c = s.charAt(0);
int idx = c - 'a';                    // 알파벳 → 0~25 인덱스
char[] cs = s.toCharArray();
Arrays.sort(cs);
String sorted = new String(cs);       // 애너그램 판별 관용구
```

> ⚠️ 반복문 안에서 `s += x` **금지**. O(n²)가 됩니다. → 반드시 `StringBuilder.append()`

**문제:** Strings: Making Anagrams / Alternating Characters / Sherlock and the Valid String

**검증:** 문자 빈도수를 `int[26]`으로 세는 코드를 즉시 작성

---

### D5. 스택 · 큐

```java
Deque<Character> stack = new ArrayDeque<>();
stack.push(c);  stack.pop();  stack.peek();  stack.isEmpty();

Deque<int[]> queue = new ArrayDeque<>();
queue.offer(new int[]{r, c});  int[] cur = queue.poll();
```

**문제:** Balanced Brackets / Equal Stacks / Min Max Riddle(도전)

**검증:** Balanced Brackets를 15분 안에 통과

---

### D6. 완전탐색 · 재귀 · 백트래킹

```java
void dfs(int depth, ...) {
    if (depth == n) { /* 정답 처리 */ return; }
    for (int i = 0; i < k; i++) {
        if (visited[i]) continue;
        visited[i] = true;
        dfs(depth + 1, ...);
        visited[i] = false;     // ← 되돌리기. 빠뜨리면 전부 틀립니다
    }
}
```

**문제:** Recursion: Fibonacci Numbers / Recursion: Davis' Staircase / Recursive Digit Sum

**검증:** 재귀 함수의 종료조건과 되돌리기 위치를 스스로 설명 가능

---

### D7. 1주차 복습 — 새 문제 금지

- D1~D6에서 **틀렸거나 검색해서 푼 문제만** 다시 풉니다
- 오답노트 작성: `문제명 | 왜 틀렸나 | 어떤 패턴이었나` 한 줄씩

**검증:** 재도전 문제를 검색 없이 전부 통과

---

## 2주차 — 유형 격파

### D8. 투포인터 · 슬라이딩 윈도우 · 누적합

O(n²) → O(n) 전환의 두 번째 무기.

```java
// 누적합: 구간 [l, r] 합을 O(1)로
long[] pre = new long[n + 1];
for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
long sum = pre[r + 1] - pre[l];
```

> ⚠️ 합계는 **거의 항상 `long`**. `int` 누적합은 10만 개만 넘어도 터집니다.

**문제:** Minimum Absolute Difference in an Array / Array Manipulation(누적합 핵심)

**검증:** Array Manipulation을 O(n) 누적합으로 통과 (O(n²)면 시간초과)

---

### D9. 이분탐색

```java
// 값 탐색
int idx = Arrays.binarySearch(a, key);   // 없으면 음수 반환

// 매개변수 탐색(파라메트릭) — 실전은 이쪽이 더 많이 나옵니다
long lo = 1, hi = MAX;
while (lo < hi) {
    long mid = lo + (hi - lo) / 2;       // (lo+hi)/2는 오버플로 위험
    if (possible(mid)) hi = mid;
    else lo = mid + 1;
}
// lo == hi == 답
```

**문제:** Hash Tables: Ice Cream Parlor / Minimum Time Required(파라메트릭)

**검증:** "최소 ~를 구하라 + 판정 함수가 만들어진다" → 이분탐색을 떠올리면 통과

---

### D10. 그리디

정렬 후 앞에서부터 취하는 패턴이 대부분. **왜 그리디가 성립하는지 한 줄로 설명할 수 있어야** 합니다.

**문제:** Luck Balance / Greedy Florist / Max Min

**검증:** 각 문제에서 "무엇을 기준으로 정렬했고 왜 그게 최적인가"를 설명

---

### D11~D12. 그래프 (BFS/DFS) — 2일 배정

2주 코스에서 **가장 배점이 높은 구간**입니다.

```java
// 2차원 격자 BFS 표준형
int[] dr = {-1, 1, 0, 0}, dc = {0, 0, -1, 1};
Deque<int[]> q = new ArrayDeque<>();
boolean[][] vis = new boolean[R][C];
q.offer(new int[]{sr, sc});  vis[sr][sc] = true;

while (!q.isEmpty()) {
    int[] cur = q.poll();
    for (int d = 0; d < 4; d++) {
        int nr = cur[0] + dr[d], nc = cur[1] + dc[d];
        if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
        if (vis[nr][nc] || grid[nr][nc] == 0) continue;
        vis[nr][nc] = true;
        q.offer(new int[]{nr, nc});
    }
}
```

> ⚠️ **방문 체크는 큐에 넣을 때** 합니다. 꺼낼 때 하면 중복 삽입으로 터집니다.

- **D11:** 격자 BFS/DFS → DFS: Connected Cell in a Grid / Find the nearest clone
- **D12:** 인접리스트 그래프 → BFS: Shortest Reach in a Graph / Roads and Libraries

**검증:** 격자 BFS 템플릿을 빈 화면에서 10분 안에 작성

---

### D13. DP 입문 (욕심내지 않기)

2주 코스에서는 **1차원 DP까지만** 확실히 합니다.

```java
// 점화식 세우는 순서: ① dp[i]가 뭘 뜻하는지 한 문장 ② 이전 상태에서 오는 경로 ③ 초기값
int[] dp = new int[n + 1];
dp[0] = 1; dp[1] = 1;
for (int i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];
```

**문제:** Max Array Sum / Candies

**검증:** `dp[i]`의 정의를 말로 먼저 쓰고 나서 코드를 짜는 습관이 붙으면 통과

---

### D14. 실전 모의 + 최종 점검

- 90분 타이머 켜고 **처음 보는 문제 3개** (Easy 1 + Medium 2)
- 끝나고 아래 체크리스트 자가진단

---

## 2. Java 특화 함정 모음 (시험 전날 이것만 다시 보기)

| # | 함정 | 대응 |
|---|---|---|
| 1 | `Scanner` 시간초과 | `BufferedReader` + `StringTokenizer` |
| 2 | `int` 오버플로 (10⁹ 초과) | 합계·곱셈은 `long` |
| 3 | `Integer` 비교에 `==` | `.equals()` 또는 `intValue()` (−128~127만 캐시됨) |
| 4 | `Arrays.sort(int[], cmp)` 없음 | `Integer[]`로 박싱 |
| 5 | 반복문 안 `String +=` | `StringBuilder` |
| 6 | `(lo+hi)/2` 오버플로 | `lo + (hi-lo)/2` |
| 7 | `list.remove(int)` vs `remove(Object)` | 값 삭제는 `remove(Integer.valueOf(x))` |
| 8 | 2차원 배열 `Arrays.fill` 안 먹힘 | 행마다 `for` 돌며 fill |
| 9 | BFS 방문체크 위치 | 큐에 **넣을 때** 체크 |
| 10 | `Stack` / `Vector` 사용 | `ArrayDeque` |

---

## 3. 최종 자가진단 체크리스트

시험 전 아래에 전부 ✅면 준비 완료입니다.

- [ ] BufferedReader 입출력 템플릿을 3분 안에 작성
- [ ] 제약조건 n을 보고 목표 복잡도를 먼저 말할 수 있음
- [ ] HashMap 개수 세기 관용구를 검색 없이 작성
- [ ] Comparator 다중 기준 정렬을 검색 없이 작성
- [ ] 격자 BFS 템플릿을 빈 화면에서 10분 안에 작성
- [ ] 이분탐색(파라메트릭) 틀을 검색 없이 작성
- [ ] `dp[i]`의 정의를 말로 먼저 쓰고 코드를 짬
- [ ] 위 함정 10개를 보고 각각 대응책이 바로 나옴

---

## 4. 운영 원칙

1. **하루 2~3문제.** 5문제 대충보다 2문제 완전이해가 낫습니다.
2. **30분 막히면 답을 봅니다.** 대신 답을 본 문제는 **다음 날 반드시 다시** 풉니다.
3. **오답노트는 코드가 아니라 패턴을 적습니다.** "정렬 후 투포인터" 한 줄이 코드 50줄보다 오래 갑니다.
4. **직접 구현은 학습용 1회.** 실전에서는 `java.util`을 씁니다. (→ 0장 결론)

---

### 참고

- 문제명은 HackerRank *Interview Preparation Kit* 기준입니다. 사이트에서 제목으로 검색하면 찾을 수 있고, 개편으로 일부 명칭이 바뀌었을 수 있습니다.
- 실행환경 사양 출처: HackerRank Execution Environment 문서
