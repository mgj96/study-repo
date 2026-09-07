# 이산수학 — 코딩테스트가 이미 가르쳐준 수학

> **이 노트의 관점**: 이산수학은 새로 배우는 과목이 아니다 — [코딩테스트 드릴](../coding-test/)에서 이미 손으로 푼 것들의 **이름과 족보**다. 여기서는 족보를 붙여서 "따로 놀던 유형들"을 한 그물로 묶는다.
> 형식: ① 결론 → ② 원리 → ③ 트레이드오프. NotebookLM 퀴즈용 용어 사전 포함.

---

## 0. 왜 만들어졌나 — 다리 건너기가 낳은 수학

- **1736 · 오일러 (쾨니히스베르크 다리 문제)** — "일곱 다리를 정확히 한 번씩 건너는 산책이 있는가?" 오일러는 지도를 버리고 **땅=점(vertex), 다리=선(edge)**으로 추상화한 뒤 "홀수 차수 정점이 2개를 넘으면 불가능"을 증명했다. **그래프 이론의 탄생** — 기하(거리·모양)를 버리고 **연결 관계만 남기는** 추상화가 핵심이었다.
- **1854 · 불(Boole)** — 논리를 대수로: 참/거짓을 1/0으로 계산하는 불 대수. 한 세기 뒤 섀넌(1937)이 이것이 **회로 그 자체**임을 보이며 디지털 컴퓨터의 수학적 기초가 됐다.
- 연속 수학(미적분)이 물리 세계를 다룬다면, **이산수학은 "셀 수 있는 것들"의 세계** — 그리고 컴퓨터는 본질적으로 셀 수 있는 기계라서, CS의 모국어가 됐다.

> 탄생 서사 한 줄: **오일러가 지도를 그래프로 바꾼 그 추상화가, 코테에서 "격자를 그래프로 보고 BFS"라고 말할 때 우리가 하는 바로 그 일이다.**

---

## 1. 지도 — 이산수학 5개 기둥 ↔ 내 코테 드릴

| 기둥 | 수학 이름 | 이미 푼 드릴 (실전판) |
|---|---|---|
| 그래프 이론 | vertex, edge, 차수, 연결성, 최단경로 | [격자 BFS/DFS](../coding-test/grid-bfs-dfs.md) · [Union-Find](../coding-test/union-find.md) |
| 조합론 (Combinatorics) | 곱의 법칙, 합의 법칙, 순열·조합, 포함-배제 | [★기출 이진 문자열 조합 개수](../coding-test/binary-distinct-combinations.md) — "나열하지 말고 세라" |
| 재귀·귀납 (Recurrence & Induction) | 점화식, 수학적 귀납법, 불변식 | [DP·배낭](../coding-test/dp-table-knapsack.md) · [파라메트릭 탐색](../coding-test/parametric-binary-search.md)의 루프 불변식 |
| 정수론 (Number Theory) | 모듈러 연산, 소수, gcd | 답을 `% 1_000_000_007`로 내는 모든 문제 |
| 논리·집합 (Logic & Sets) | 명제, 집합 연산, 관계, 함수 | [해시 집계](../coding-test/prefix-sum-hashmap.md)의 키 공간 설계, 그리디의 [교환 논증](../coding-test/greedy-exchange-argument.md)(증명) |

**Java 번역**: `Set`/`Map` = 집합·함수, `boolean` 논리 = 불 대수, 인접 리스트 = 그래프, 재귀 호출 스택 = 귀납의 실행형. **이산수학은 자바 컬렉션 프레임워크의 이론편이다.**

---

## 2. 기둥별 핵심 — "이름 붙이기"

### 2.1 그래프 — 연결만 남기는 추상화

- 오일러의 정리(한붓그리기): **홀수 차수 정점이 0개 또는 2개**일 때만 가능. 증명 감각 — "들어간 횟수 = 나온 횟수"여야 하니 중간 정점은 짝수 차수여야 한다.
- 코테 번역: 격자·미로·친구관계·환승 — 겉모습이 달라도 **"점과 연결"로 환원되면 같은 문제**. BFS = 간선 가중치 1의 최단경로, Union-Find = "연결됐는가"만 묻는 동치관계 관리.
- 트리 = **사이클 없는 연결 그래프** (정점 n, 간선 n-1). 이 정의 하나로 "간선 수 세기" 류 문제가 판별된다.

### 2.2 조합론 — 나열하지 말고 세라

- 곱의 법칙(각 자리 독립 선택), 합의 법칙(케이스 분할), 그리고 **중복을 빼는 기술**(포함-배제, 또는 기출처럼 "덮어쓰기 = 자동 dedup"인 DP 설계).
- $nCr = \frac{n!}{r!(n-r)!}$ 자체보다 중요한 건 **"이 문제의 답이 폭발적으로 커진다 → 직접 나열 금지, 세는 구조를 설계하라"**는 판별 신호. 기출 노트의 `end[c]` DP가 정확히 그 사례다.

### 2.3 재귀·귀납·불변식 — 루프의 증명 도구

- 수학적 귀납법 = "기저 성립 + k 성립하면 k+1 성립" → 이게 코드에서는 **루프 불변식**(매 반복 전에 참인 명제)이 된다.
- 파라메트릭 탐색의 `lo`/`hi` 불변식("lo 왼쪽은 전부 ✗, hi 오른쪽은 전부 ✓")이 실전형 — **불변식을 문장으로 못 쓰면 경계(±1) 버그가 난다.**
- 점화식(recurrence) = DP의 수학 이름: $f(n)$을 $f(작은\ n)$으로 표현하기.

### 2.4 정수론 — mod는 왜 1e9+7인가

- 답이 커지는 문제는 **모듈러 산술**로 관리: $(a+b) \bmod m = ((a \bmod m) + (b \bmod m)) \bmod m$ — 덧셈·곱셈은 중간중간 mod를 걸어도 안전하다 (나눗셈은 다름 — 모듈러 역원 필요, Lv3+).
- $10^9+7$인 이유: **소수**라서 역원이 존재하고, int 범위를 살짝 넘는 크기라 `long` 곱셈 한 번까지는 오버플로 안 남 — 관례이자 실용의 타협.

### 2.5 논리·집합 — 문제 지문의 문법

- 지문의 "모든/어떤(∀/∃)", "A이면 B", "이상/초과"가 곧 논리식이다. **대우**(B가 아니면 A가 아니다)로 뒤집으면 쉬워지는 문제가 많다 — 그리디 반례 찾기가 사실 "명제의 반증" 연습이다.
- 집합으로 상태 공간을 정의하는 습관: "visited 집합", "가능한 답의 집합 ✗✗✓✓" — [탐색 드릴들](../coding-test/README.md)의 공통 어휘.

---

## 3. 3단 요약 (암기)

- **① 결론 · WHAT** — 이산수학은 "셀 수 있는 것들의 수학"(그래프·조합·재귀·정수론·논리)이고, 코딩테스트 Lv2 유형들은 이 다섯 기둥의 실전판이다. 새 과목이 아니라 이미 푼 것들의 족보다.
- **② 원리 · HOW** — 공통 무기는 **추상화와 증명**: 오일러처럼 문제를 점·선·집합으로 환원하고, 귀납법(=루프 불변식)으로 맞음을 보장하며, 폭발하는 경우의 수는 나열 대신 구조(점화식·곱의 법칙)로 센다.
- **③ 확장 · TRADE-OFF** — 이산수학의 힘은 **버리는 것**에서 온다 — 오일러는 거리·모양을 버려서 다리 문제를 풀었다. 대신 버린 정보가 필요한 문제(기하·최적 경로의 실거리)에는 다른 도구가 필요하다. "무엇을 버려도 되는 문제인가"가 모델링 감각의 본체다.

## 용어 사전 (영 ↔ 한)

| 용어 | 뜻 |
|---|---|
| vertex / edge / degree | 정점 / 간선 / 차수 (정점에 붙은 간선 수) |
| Eulerian path | 한붓그리기 경로 — 홀수 차수 정점 0 또는 2개 |
| combinatorics / permutation / combination | 조합론 / 순열(순서 O) / 조합(순서 X) |
| inclusion-exclusion | 포함-배제 — 겹친 만큼 빼기 |
| recurrence relation | 점화식 — f(n)을 작은 f로 표현 |
| mathematical induction | 수학적 귀납법 — 기저 + 계단 |
| loop invariant | 루프 불변식 — 매 반복 전 참인 명제 |
| modular arithmetic | 모듈러 산술 — 나머지 세계의 연산 |
| modular inverse | 모듈러 역원 — mod 세계의 나눗셈 (m이 소수면 존재) |
| proposition / contrapositive | 명제 / 대우 (진리값 같음) |
| equivalence relation | 동치관계 — 반사·대칭·추이 (Union-Find가 관리하는 것) |

---

## 출처

- [Encyclopedia — The Birth of Graph Theory: Euler and the Königsberg Bridge Problem](https://www.encyclopedia.com/science/encyclopedias-almanacs-transcripts-and-maps/birth-graph-theory-leonhard-euler-and-konigsberg-bridge-problem)
- [Britannica — Königsberg bridge problem](https://www.britannica.com/science/Konigsberg-bridge-problem)
- [MAA — Euler's Solution to the Königsberg Bridge Problem](https://old.maa.org/press/periodicals/convergence/leonard-eulers-solution-to-the-konigsberg-bridge-problem)

## 연결

- 실전판 전체 색인: [코딩테스트 폴더](../coding-test/README.md)
- 같은 수학 그룹: [FEM의 수학](fem-and-linear-algebra.md) (연속 수학이 이산화되는 순간) · [선형대수](linear-algebra-essentials.md)
- 증명 사고의 면접판: [그리디 교환 논증](../coding-test/greedy-exchange-argument.md)
