# PR 자동 리뷰 봇 (LLM + GitHub Actions)

## 한 줄 정의

PR이 올라오면 **LLM이 변경된 코드(diff)를 읽고 자동으로 리뷰 코멘트**를 다는 워크플로우.

```
PR 생성/업데이트 → diff 추출 → LLM에 리뷰 요청 → PR에 코멘트 게시
```

---

## 누가 리뷰하나 (사용 모델)

- **Gemini (`gemini-3-flash-preview`)** 사용
- 이유: trending-news에 이미 `GEMINI_API_KEY` 시크릿이 있어 **새 키 발급 불필요**
- 모델명은 빠르게 바뀌므로 **이미 검증된 코드(trending.py)의 모델명을 재사용**하는 게 안전

---

## 언제, 몇 번 도나 (빈도)

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
```

| 이벤트 | 의미 | 리뷰 |
|--------|------|------|
| `opened` | PR 처음 열림 | 1회 |
| `synchronize` | PR에 새 커밋 push | push마다 1회 |
| `reopened` | 닫힌 PR 다시 열림 | 1회 |

→ **PR 1건당 고정 횟수가 아니라, 위 이벤트가 일어날 때마다** 돈다.
→ 커밋을 5번 push하면 리뷰도 5번. (비용 주의)

---

## 무엇을 기반으로 체크하나

1. **diff 내용** — base 브랜치와의 차이만 추출 (`git diff origin/<base>...HEAD`)
2. **프롬프트에 명시한 기준:**
   - 버그 가능성 (널/예외/경계조건)
   - 보안 (하드코딩 시크릿, 인젝션, 권한 과다)
   - 가독성/유지보수 (네이밍, 중복, 복잡도)
3. **diff 크기 제한** — 너무 크면 토큰 초과 → 앞부분만(약 6만 자) 잘라서 전송

---

## 워크플로우 핵심

```yaml
name: PR AI Review
on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:        # 최소 권한 원칙
  contents: read        # 코드 읽기
  pull-requests: write  # 코멘트 달기

jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }   # base 비교용 전체 히스토리
      - uses: actions/setup-python@v5
        with: { python-version: '3.10' }
      - run: pip install google-generativeai
      - run: git diff origin/${{ github.base_ref }}...HEAD > pr.diff
      - run: python scripts/pr_review.py
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      - run: gh pr comment ${{ github.event.pull_request.number }} --body-file review.md -R ${{ github.repository }}
        env:
          GH_TOKEN: ${{ github.token }}
```

---

## 보안 — 가장 중요

| 항목 | 선택 | 이유 |
|------|------|------|
| 트리거 | `pull_request` | 포크 PR엔 시크릿 미제공 → **시크릿 탈취 방지** |
| 금지 | `pull_request_target` | 시크릿 노출 → 악성 PR이 키 탈취 가능 |
| 권한 | `contents:read` + `pull-requests:write`만 | 최소 권한 원칙 |
| 토큰 | `github.token` | 깃허브가 자동 발급하는 임시 토큰 (수동 PAT 불필요) |

---

## 실전 교훈 — LLM 리뷰를 맹신하지 마라

이 봇을 만들 때 실제로 겪은 일:

봇이 자기 PR을 리뷰하면서 이렇게 지적했다:
> "`gemini-3-flash-preview`는 존재하지 않는 모델명입니다. `gemini-1.5-flash`로 수정하세요."

**완전히 틀린 지적이었다.** 봇은 바로 그 `gemini-3-flash-preview` 모델로 돌고 있었고,
추천한 `gemini-1.5-flash`는 이미 404로 실패했던 옛날 모델이었다.

→ 원인: **Knowledge Cutoff + Hallucination**.
   Gemini의 학습 데이터는 자기보다 나중에 나온 모델을 모른다.
   그래서 "최신 모델 = 1.5-flash"라고 자신있게 헛소리를 했다.

반면 같은 리뷰에서:
> "`resp.text`가 안전 필터 차단 시 예외를 던질 수 있다"
는 **유효한 지적이었고, 실제로 방어 코드를 추가**했다.

**결론:** LLM 리뷰는 "유효한 지적 + 그럴듯한 헛소리"가 섞여 나온다.
사람이 옥석을 가려야 한다. → [LLM이란 무엇인가](../llm/what-is-llm.md)의 한계 참고.

---

## 관련 문서

- [LLM이란 무엇인가](../llm/what-is-llm.md) — hallucination, knowledge cutoff
- [Reusable Workflows](reusable-workflows.md)
- 실제 적용 PR: mgj96/trending-news#2
