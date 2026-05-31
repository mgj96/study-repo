# 카파시(Karpathy) 접근법 — 밑바닥부터 이해하기

## 핵심 철학

Andrej Karpathy (OpenAI 공동창업자, 전 Tesla AI 디렉터, 현 Anthropic pre-training)의 학습 철학:

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

### 카파시의 CLAUDE.md 4원칙

그가 Claude Code를 집중적으로 쓴 뒤 정리한 4가지 행동 원칙. 프로젝트 루트의
`CLAUDE.md`에 넣어 에이전트의 코딩 습관을 교정하는 용도로, 사실상 위 정신의 실천판이다.

- **Think Before Coding** — 코딩 전에 먼저 생각
- **Simplicity First** — 단순함 우선
- **Surgical Changes** — 수술적·최소 변경
- **Goal-Driven Execution** — 목표 주도 실행

(이 4줄을 개발자 Forrest Chang이 70줄 `CLAUDE.md`로 정리한 버전이 GitHub에서 10만+ 스타.)

## LLM Wiki — 이 레포의 뿌리

카파시는 "밑바닥 이해"에서 더 나아가, **지식을 어떻게 저장할지**에 대한 패턴도 제시했다:
**RAG(벡터DB) 대신, LLM이 함께 관리하는 "구조화된 마크다운 지식베이스"**.

- 핵심 주장: 임베딩 없이도, 잘 구조화된 md 문서 모음이 더 **투명하고 유지보수 쉽다**
- 그리고 그 md는 **1회성 문서가 아니라 계속 갱신되는 살아있는 위키** — 새 사실이 나오면
  토막을 덧붙이는 게 아니라 본문을 고친다 (그래서 이 문서도 그렇게 관리한다)
- → **이 study-repo가 바로 그 패턴의 실천**이다

이 두 축(밑바닥 이해 + md 지식 구조화)이 이 레포 전체의 운영 철학이다.

## 관련 문서

- [LLM이란 무엇인가](what-is-llm.md)
- [모델별 비교](model-comparison.md)
- [LLM으로 지식 유지하기](../obsidian/llm-knowledge-management.md) — LLM Wiki 패턴의 실천
