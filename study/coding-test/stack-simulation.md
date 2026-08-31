# 유형 훈련 — 스택 시뮬레이션: "가장 최근 것과 짝짓기"

> 백로그 8번 (출제 대비). 실습: 괄호 유효성 + 인접 중복 제거 (프로그래머스 "짝지어 제거하기" 동형).
> **난이도**: 프로그래머스 **Lv1~2** · 기업 1~2번 — 쉬운 편이지만 **판별을 놓치면 O(n²) 문자열 삭제로 시간초과**하는 함정 유형.
> 진행: **🤔 생각 → 📖 읽기 → ✅ 확인** 순서.

---

## 0단계. 판별 — 지문 신호

| 지문 신호 | 판단 |
|---|---|
| "**가장 최근/가장 가까운** 것과 짝·상쇄·제거" | 스택 확정 |
| 짝이 맞으면 **사라지고, 그 양옆이 새로 만난다** | 스택 확정 (삭제 후 재검사를 스택이 공짜로 해줌) |
| "앞에서부터 순서대로 처리" (최근성 없음) | 그냥 큐/루프 |

> 판별 한 줄: **"지워지면 그 양옆이 만난다"는 문장이 보이면 스택이다** — 문자열에서 지우며 반복하면 O(n²), 스택이면 O(n).

---

## 1단계. 🤔 생각 — 왜 "지우고 다시 검사"가 스택 한 번으로 끝나나?

<details><summary>📖 추론 열기</summary>

`baab`에서 `aa`를 지우면 `bb`가 새로 붙는다 — 삭제가 **연쇄**를 만든다. 문자열로 구현하면 지울 때마다 처음부터 재검사.

스택으로 보면: 문자를 밀어넣다가 **top과 짝이면 pop**. `aa`가 pop되는 순간 top엔 자동으로 이전 `b`가 드러나 다음 `b`와 만난다 — **연쇄 재검사가 스택 구조 자체에 내장**돼 있다. 각 문자는 최대 1번 push·1번 pop → O(n).

</details>

**✅ 확인**: `baab` 손 추적 — push b, push a, a==top? pop(a), b==top? pop(b) → 빈 스택 = 전부 제거 ✓

---

## 2단계. 결론 — 템플릿 2벌 (Java)

```java
// ① 인접 짝 제거 (같은 문자 만나면 상쇄)
static boolean allRemoved(String s) {
    Deque<Character> st = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if (!st.isEmpty() && st.peek() == c) st.pop();   // 짝 — 상쇄
        else st.push(c);
    }
    return st.isEmpty();
}

// ② 괄호 유효성 (여는 건 push, 닫는 건 top과 대조)
static boolean valid(String s) {
    Deque<Character> st = new ArrayDeque<>();
    Map<Character, Character> pair = Map.of(')', '(', ']', '[', '}', '{');
    for (char c : s.toCharArray()) {
        if (!pair.containsKey(c)) st.push(c);
        else if (st.isEmpty() || st.pop() != pair.get(c)) return false;  // ★ 빈 스택 검사 먼저
    }
    return st.isEmpty();                                 // ★ 남으면 미완성 괄호
}
```

## 3단계. 함정 체크리스트

- [ ] **빈 스택에서 pop/peek** — `)`로 시작하는 입력에서 예외. `isEmpty()` 검사가 항상 먼저
- [ ] 루프 끝나고 **스택이 비었는지 최종 확인** — `(((`은 루프에서 안 걸린다
- [ ] `java.util.Stack` 대신 **`ArrayDeque`** (Stack은 동기화 오버헤드 있는 레거시)
- [ ] 문자열 삭제로 구현하지 않았나 — `replace` 반복은 O(n²)

## 3단 요약 (암기)

- **① 결론 · WHAT** — "가장 최근 것과 짝·상쇄"는 스택: push하다 top과 짝이면 pop, O(n). 괄호·인접 제거·수식 계산이 전부 이 틀.
- **② 원리 · HOW** — 상쇄 후 "양옆이 새로 만나는" 연쇄가 스택 top에 자연히 드러나므로 재검사가 공짜다 — 각 원소 push/pop 1회씩이라는 상한이 O(n)의 증명.
- **③ 확장 · TRADE-OFF** — 빈출 확장은 히스토그램 최대 직사각형·오큰수(단조 스택)인데 그건 3번 문제 급 — 2번 대역에선 "빈 스택 검사·최종 잔여 검사" 두 함정만 완벽하면 만점 유형이다.
