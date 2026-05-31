# 카파시(Karpathy) 접근법 — 밑바닥부터 이해하기

## 핵심 철학

Andrej Karpathy (전 Tesla AI 디렉터, OpenAI 공동창업자)의 학습 철학:

> **"블랙박스를 쓰지 말고, 직접 만들어봐야 진짜로 이해한다."**

라이브러리를 가져다 쓰기 전에 그 라이브러리가 내부에서 무엇을 하는지 직접 구현해보는 것.

---

## LLM에 적용하면

| 수준 | 하는 것 | 이해 깊이 |
|------|---------|----------|
| 사용자 | ChatGPT 쓰기 | 입출력만 앎 |
| 개발자 | API 호출, 프롬프트 튜닝 | 파라미터 의미 앎 |
| **카파시 방식** | Transformer 직접 구현 | 왜 그렇게 동작하는지 앎 |

카파시의 대표 프로젝트:
- **nanoGPT** — GPT를 300줄로 직접 구현
- **micrograd** — 역전파를 100줄로 구현
- **llm.c** — C언어로 LLM 학습 구현

---

## 왜 이 접근법이 중요한가

```
블랙박스 사용자:
"왜 hallucination이 생기지?" → 모름

카파시 방식:
"왜 hallucination이 생기지?"
→ softmax 확률 분포에서 top-1이 항상 정답이 아님
→ 학습 데이터에 없는 패턴은 유사한 패턴으로 근사함
→ 그러니 검증이 필요한 것
```

---

## 실천 방법

### 1단계: 개념을 직접 구현해보기
```python
# Attention 메커니즘 직접 구현
import numpy as np

def attention(Q, K, V):
    d_k = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)   # 스케일링
    weights = softmax(scores)           # 확률화
    return weights @ V                  # 가중 합산
```

### 2단계: 작은 것부터 키우기
- 토크나이저 → 임베딩 → attention → transformer → GPT

### 3단계: 도구를 쓸 때도 내부를 의식하기
```
Claude Code 쓸 때:
"이 응답이 왜 이렇게 나왔지?"
→ context에 뭐가 들어갔는지 의식
→ temperature 설정이 영향을 줬나?
→ system prompt가 행동을 제약하고 있나?
```

---

## Claude Code와 연결

카파시 정신을 Claude Code 협업에 적용하면:

- **모호하게 "해줘"** 가 아니라 내가 어디서 막혔는지 정확히 설명
- **결과만 받지 말고** 왜 그 방식인지 물어보기
- **생성된 코드를 그대로 쓰지 말고** 한 줄씩 이해한 뒤 사용

> 도구를 잘 쓰는 것과 도구에 의존하는 것은 다르다.

## 최근 근황 (2026, 검증됨)

> ⚠️ 흔한 오해 정정: "카파시가 Codex(OpenAI)에 갔다"가 아니라 **Anthropic**(Claude 제작사)에 합류.

- **2026-05-19 Anthropic 합류** — pre-training 팀(팀리드 Nick Joseph).
  **Claude로 사전학습 연구를 가속**하는 새 팀을 맡는다. (Tesla→OpenAI→Eureka Labs→Anthropic)
  출처: [TechCrunch](https://techcrunch.com/2026/05/19/openai-co-founder-andrej-karpathy-joins-anthropics-pre-training-team/),
  [본인 X](https://x.com/karpathy/status/2056753169888334312)

### 화제가 된 마크다운 문서 2가지

**1. CLAUDE.md — 4가지 행동 원칙 (10만+ 스타)**
2026-01-26 카파시가 Claude Code를 집중적으로 쓴 뒤 X에 올린 관찰을
개발자 Forrest Chang이 70줄짜리 `CLAUDE.md`로 정리 → GitHub 트렌딩 28일 연속 1위.
- Think Before Coding (코딩 전에 생각)
- Simplicity First (단순함 우선)
- Surgical Changes (수술적·최소 변경)
- Goal-Driven Execution (목표 주도 실행)
출처: [miraflow](https://miraflow.ai/blog/karpathy-claude-md-100k-github-stars-ai-coding-2026)

**2. LLM Wiki — 이 study-repo가 바로 이 패턴! (1600만 뷰)**
2026-04-03 카파시가 Gist 공개: **RAG 대신, LLM이 관리하는 "구조화된 마크다운 지식베이스"**.
- 핵심 주장: 벡터DB·임베딩 없이도, 잘 구조화된 md 문서 모음이 더 투명하고 유지보수 쉽다
- → **우리가 만든 study-repo(md 지식 창고)가 정확히 이 아이디어의 실천**이다
출처: [Karpathy Gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f),
[remio 해설](https://www.remio.ai/post/andrej-karpathy-published-an-llm-wiki-pattern-16-million-views-for-a-folder-structure)

> 정리: 카파시는 "밑바닥 이해"뿐 아니라 **"md로 지식을 구조화해 LLM과 협업"** 까지 밀고 있고,
> 이 레포는 그 두 철학을 동시에 따르는 셈이다.

## 관련 문서

- [LLM이란 무엇인가](what-is-llm.md)
- [모델별 비교](model-comparison.md)
- [LLM으로 지식 유지하기](../obsidian/llm-knowledge-management.md) — LLM Wiki 패턴의 실천
