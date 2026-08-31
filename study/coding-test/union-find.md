# 유형 훈련 — Union-Find: "연결이 하나씩 추가되는" 문제

> 백로그 7번 (출제 대비). 실습 문제: 친구 네트워크 (연결될 때마다 무리 크기 출력).
> **난이도**: 프로그래머스 **Lv2~3** · 기업 2~3번.
> 진행: **🤔 생각 → 📖 읽기 → ✅ 확인** 순서.

---

## 0단계. 판별 — BFS와의 갈림길

| 지문 신호 | 판단 |
|---|---|
| 그래프가 **고정**돼 있고 덩어리를 세라 | [BFS/DFS](grid-bfs-dfs.md)로 충분 |
| **간선이 하나씩 추가되면서** 그때마다 "같은 그룹인가?"/"그룹 크기는?" 질의 | **Union-Find** — 매번 BFS를 다시 돌리면 O(질의×n) 낭비 |
| "사이클이 생기는 순간을 찾아라" | Union-Find (같은 루트끼리 union 시도 = 사이클) |

> 판별 한 줄: **그래프가 "자라나는 중"에 질의가 끼어들면 Union-Find다.**

---

## 1단계. 🤔 생각 — 왜 "대표(루트)"만 관리하면 되나?

<details><summary>📖 추론 열기</summary>

"같은 그룹인가?"에 필요한 건 구성원 목록이 아니라 **그룹의 신분증 하나**다. 각 원소가 부모를 가리키게 하고, 뿌리(대표)가 같으면 같은 그룹 — 집합 비교를 **대표 비교로 축소**한 것이다.

빠르게 만드는 최적화 2개: **경로 압축**(find 하며 만난 노드를 전부 루트 직결로) + **크기 기준 병합**(작은 트리를 큰 트리 밑으로). 둘을 합치면 연산당 사실상 O(1) (역아커만 α).

</details>

**✅ 확인**: 압축 없이 1-2-3-…-n 사슬로 union하면 find가 O(n) — 최적화가 장식이 아닌 이유.

---

## 2단계. 결론 — 템플릿 (Java)

```java
static int[] parent, size;

static void init(int n) {
    parent = new int[n]; size = new int[n];
    for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
}
static int find(int x) {
    if (parent[x] == x) return x;
    return parent[x] = find(parent[x]);        // ★ 경로 압축 — 대입이 핵심
}
static int union(int a, int b) {               // 병합 후 그룹 크기 반환
    int ra = find(a), rb = find(b);
    if (ra == rb) return size[ra];             // 이미 같은 그룹 (사이클 판정 지점)
    if (size[ra] < size[rb]) { int t = ra; ra = rb; rb = t; }
    parent[rb] = ra;                           // 작은 쪽을 큰 쪽 밑으로
    size[ra] += size[rb];
    return size[ra];
}
```

## 3단계. ✅ 확인 + 함정

union(1,2)→2, union(3,4)→2, union(2,3)→**4** — 손으로 트리 그려 검증.

- [ ] `parent[x] = find(...)` **대입**을 빼먹으면 압축이 안 됨 (동작은 하지만 느려짐 — 숨은 시간초과)
- [ ] 이름이 문자열로 오면 `HashMap<String,Integer>`로 번호 매핑부터
- [ ] size는 **루트에서만 유효** — 반드시 find 후 조회
- [ ] 노드 수를 모르면 배열 대신 Map 기반, 또는 등장 시점에 init

## 3단 요약 (암기)

- **① 결론 · WHAT** — 자라나는 그래프의 그룹 질의는 Union-Find: find(대표 조회)+union(병합), 경로 압축+크기 병합으로 연산당 사실상 O(1).
- **② 원리 · HOW** — 집합 비교를 **대표 비교로 축소**한 구조. 같은 루트에 union 시도 = 사이클 발견이라는 부수 효과가 크루스칼 MST의 심장이기도 하다.
- **③ 확장 · TRADE-OFF** — 못 하는 것: **분리(un-union)와 경로 자체 복원** — 그게 필요하면 다른 도구다. 고정 그래프 한 번 질의면 BFS가 더 단순하다는 판별을 잊지 말 것.
