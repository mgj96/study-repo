# study-repo

AI 도구를 적극적으로 활용하는 개발자의 지식 창고.  
Claude Code와 함께 학습하고, 논의한 내용을 정리한다.

---

## 구조

```
study-repo/
  llm/             LLM 이해와 활용
  obsidian/        지식 관리 방법론
  github-actions/  GitHub Actions 심화
```

---

## LLM 이해와 활용

| 문서 | 내용 |
|------|------|
| [LLM이란 무엇인가](llm/what-is-llm.md) | 작동 원리, 토큰, context window, 한계 |
| [모델별 비교](llm/model-comparison.md) | Copilot, Claude Code, Gemini, Codex — context 크기 & 코드베이스 읽기 방식 |
| [도구 검색·컨텍스트·용도](llm/tools-search-and-context.md) | 도구별 검색 방식(근접/에이전트/RAG/통째), 컨텍스트량, 용도별 선택 가이드 |
| [카파시 접근법](llm/karpathy-approach.md) | 밑바닥부터 이해하는 학습 철학 |
| [코드베이스 분석 방법](llm/codebase-analysis.md) | Claude Code와 작업할 때 알려줘야 할 것들, 실전 프롬프트 패턴 |

## GitHub Actions 심화

| 문서 | 내용 |
|------|------|
| [Reusable Workflows](github-actions/reusable-workflows.md) | 워크플로우를 함수처럼 재사용 — caller/called 구조, 실제 리팩토링 사례 |
| [PR 자동 리뷰 봇](github-actions/pr-review-bot.md) | LLM이 PR diff를 자동 리뷰 — 모델/빈도/체크기준, 보안, hallucination 실전 사례 |

## Obsidian & 지식 관리

| 문서 | 내용 |
|------|------|
| [Obsidian이란](obsidian/what-is-obsidian.md) | 마크다운 기반 지식 관리 도구 |
| [LLM으로 지식 유지하기](obsidian/llm-knowledge-management.md) | LLM 기억 없음 문제 해결법 |
| [링크 가이드](obsidian/linking-guide.md) | 이 레포의 노트 연결 방식 |

---

## 학습 순서 추천

1. [LLM이란 무엇인가](llm/what-is-llm.md) — 기반 개념
2. [카파시 접근법](llm/karpathy-approach.md) — 학습 철학
3. [모델별 비교](llm/model-comparison.md) — 도구 선택
4. [코드베이스 분석 방법](llm/codebase-analysis.md) — 실전 활용
5. [LLM으로 지식 유지하기](obsidian/llm-knowledge-management.md) — 지식 누적

---

> Claude Code와 논의하며 내용을 결정하고, 합의된 내용을 이 레포에 저장하는 방식으로 운영.
