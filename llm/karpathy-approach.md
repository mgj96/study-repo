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

## 관련 문서

- [LLM이란 무엇인가](what-is-llm.md)
- [모델별 비교](model-comparison.md)
