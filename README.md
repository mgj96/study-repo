# study-repo

AI 도구를 적극적으로 활용하는 개발자의 지식 창고.  
Claude Code와 함께 학습하고, 논의한 내용을 정리한다.

---

## 구조

```
study-repo/
  learning-path.md 바닥(Big-O)부터 LLM까지 학습 순서 지도 ★시작점
  algorithms/      알고리즘 정석 (Big-O부터, 직접 풀 문제 포함)
  llm/             LLM 이해와 활용
  concepts/        LLM 핵심 개념 학습문서 (정렬·MoE 등)
  papers/          검증된 논문 리스트 (인용·발췌)
  cs-fundamentals/ CS 기초 — 하드웨어를 의식하는 사고
  conventions/     찾기 좋은 코드 = 좋은 아키텍처·명명
  tradeoffs/       정답은 없다 — 실무 경험담·대체 방식
  github-actions/  GitHub Actions 심화
  obsidian/        지식 관리 방법론
```

---

## 🧭 시작점 — 학습 로드맵

| 문서 | 내용 |
|------|------|
| [learning-path.md](learning-path.md) | 바닥(수학·Big-O)부터 LLM 내부까지 단계별 순서. **여기부터 보세요** |

## 알고리즘 정석 (algorithms/)

| 문서 | 내용 |
|------|------|
| [Big-O 표기](algorithms/big-o-notation.md) | 정의·단순화 규칙·분석법·함정 + **직접 풀어보기 문제** |

## LLM 이해와 활용

| 문서 | 내용 |
|------|------|
| [LLM이란 무엇인가](llm/what-is-llm.md) | 작동 원리, 토큰, context window, 한계 |
| [모델별 비교](llm/model-comparison.md) | Copilot, Claude Code, Gemini, Codex — context 크기 & 코드베이스 읽기 방식 |
| [도구 검색·컨텍스트·용도](llm/tools-search-and-context.md) | 도구별 검색 방식(근접/에이전트/RAG/통째), 컨텍스트량, 용도별 선택 가이드 |
| [카파시 접근법](llm/karpathy-approach.md) | 밑바닥부터 이해하는 학습 철학 |
| [코드베이스 분석 방법](llm/codebase-analysis.md) | Claude Code와 작업할 때 알려줘야 할 것들, 실전 프롬프트 패턴 |

## LLM 핵심 개념 (concepts/)

| 문서 | 내용 |
|------|------|
| [RLHF / RLAIF 정렬](concepts/rlhf-rlaif-alignment.md) | 모델을 '말 잘 듣게' 만드는 정렬 — SFT→RM→PPO, Constitutional AI, DPO |
| [MoE (Mixture-of-Experts)](concepts/mixture-of-experts.md) | 적게 켜서 크게 쓰는 구조 — 희소 활성화, 셀프호스팅 메모리 |

## 논문 리스트 (papers/)

| 문서 | 내용 |
|------|------|
| [환각·추론·창발](papers/hallucination-reasoning-emergence.md) | 검증된 arXiv 논문 — 왜 환각이 불가피하고 창의와 연결되는지, 추론·창발 |

## CS 기초 (cs-fundamentals/)

| 문서 | 내용 |
|------|------|
| [메모리 계층과 지연시간](cs-fundamentals/memory-hierarchy-and-latency.md) | L1~네트워크 지연 직관, 캐시·지역성 |
| [Scale-up vs Scale-out](cs-fundamentals/scaling-up-vs-out.md) | 수직/수평 확장 트레이드오프, 병목 찾기 |
| [스케일의 현실 — 중소 4개 회사](cs-fundamentals/scale-reality-small-medium.md) | StackOverflow·37signals·Instagram·PrimeVideo로 보는 "복붙 금지" |
| [동시성 vs 병렬성](cs-fundamentals/concurrency-vs-parallelism.md) | 구조 vs 실행, 이벤트루프, I/O·CPU 바운드 |
| [시간복잡도·자료구조](cs-fundamentals/time-complexity-and-data-structures.md) | Big-O 직관, 자료구조 선택, 캐시 친화성 |
| [프로세스/스레드·OS 기초](cs-fundamentals/process-thread-os-basics.md) | 컨텍스트 스위치 비용, 가상메모리·스왑 |
| [네트워크 기초](cs-fundamentals/networking-basics.md) | 지연 vs 대역폭, 왕복 비용 줄이기 |

## 아키텍처·규칙 (conventions/)

| 문서 | 내용 |
|------|------|
| [Findability-Driven Design](conventions/findability-driven-design.md) | 찾기 좋은 코드 = 좋은 아키텍처(FSD·DDD)·명명 → CLAUDE.md |

## 실무 트레이드오프 (tradeoffs/)

| 문서 | 내용 |
|------|------|
| [정답은 없다 — 경험담·대체 방식](tradeoffs/no-single-right-answer.md) | Redis→DB 행락, MSA→모놀리스, 인덱스·캐시·UUID 등 10가지 통념 점검 |
| [트레이드오프 읽는 법 + 지표](tradeoffs/reading-tradeoffs-and-metrics.md) | 무엇을 얻고 잃나, 지표는 수단(Goodhart)·측정 먼저(Knuth) |

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

## NotebookLM에 넣어 학습하기

이 레포의 .md를 Google **NotebookLM**(마크다운 공식 지원)에 올려 질문·요약·오디오 학습에 쓴다.

**분리 단위 = 카테고리.** 폴더 1개 → 번들 .md 1개 → NotebookLM 소스 1개.
(NotebookLM 제한: 소스 50개 / 소스당 50만 단어. 카테고리로 묶으면 관련 지식이 한 소스에
모이고, 문서를 추가해도 그 번들만 커진다 → 확장성 좋음.)

```bash
bash scripts/bundle-for-notebooklm.sh   # dist/notebooklm/<카테고리>.md 생성
# → dist/notebooklm/ 의 .md들을 NotebookLM에 업로드
```

**맥에서 딸깍(더블클릭):** `notebooklm-bundle.command` 더블클릭 →
최신화 + 번들 생성 + 폴더 열기까지 한 번에. (첫 실행만 우클릭→"열기")

> study-repo(.md, git 버전관리)가 **진실의 원천**, NotebookLM은 소비·학습용.
> 새 작업은 요약해서 해당 카테고리 .md에 추가 → 스크립트 재실행 → 재업로드.

---

> Claude Code와 논의하며 내용을 결정하고, 합의된 내용을 이 레포에 저장하는 방식으로 운영.
