# 논문으로 보는 LLM — 환각·추론·창발 (읽을거리)

> 초안 (검토 중). LLM을 "밑바닥부터" 이해하려는 사람을 위한 검증된 논문 리스트.
> 모든 항목은 실제 arXiv 논문이며, 한 줄 발췌 + 링크를 단다.
> ⚠️ LLM이 가짜 논문을 지어내는 일이 흔하므로, 인용 전 반드시 원문 링크를 확인할 것.

## 큰 그림 — 왜 "버전에 따라 이론이 달라지나"

LLM 능력에 대한 "이론"은 고정된 진리가 아니다. **무엇을, 어떻게 측정하느냐**에 따라
결론이 바뀐다(아래 C). 그래서 모델 버전·학습법·평가 벤치가 바뀌면 "이 모델은 추론한다/
못 한다" 같은 해석도 흔들린다. → 논문을 읽을 때 **결론보다 '어떤 가정·지표 위에서
나온 결론인지'를 먼저 본다.**

---

## A. 환각(Hallucination) — 왜 있고, 왜 못/안 없애나

### 1. Why Language Models Hallucinate (Kalai 외, OpenAI, 2025)
arXiv: [2509.04664](https://arxiv.org/abs/2509.04664)
- 환각은 미스터리가 아니라 **통계적 부산물**. 표준 훈련·평가가 "모르면 찍기"를 보상하기 때문.
- LLM은 "시험 잘 보는 기계"로 최적화됨 → 불확실할 때 찍으면 점수가 오르니 찍는다.
- 해법: 새 환각 벤치를 추가하는 게 아니라, **기존 벤치의 채점 방식**(불확실성 처벌)을 고쳐야.

### 2. Hallucination is Inevitable: An Innate Limitation of LLMs (Xu 외, 2024)
arXiv: [2401.11817](https://arxiv.org/abs/2401.11817)
- 환각을 **형식적으로 정의**하고, 제거 불가능함을 **증명**.
- LLM은 모든 계산 가능 함수를 학습할 수 없으므로, 범용 문제해결기로 쓰면 **반드시** 환각.

### 3. On the Fundamental Impossibility of Hallucination Control (2025)
arXiv: [2506.06382](https://arxiv.org/abs/2506.06382)
- **창의성 = 환각의 다른 얼굴.** 새로운 비유·예측을 만들려면 데이터 너머로 나가야 하고,
  그건 "정보 보존의 위반" → 창의는 본질적으로 환각을 동반.
- 그래서 용도별로 트레이드오프를 설계: **의료 진단=진실성 최대**, **창작 도구=통제된 환각 허용**.
- → "환각을 0으로 만들면 창의도 0이 된다"는 핵심 통찰.

### 4. H-Neurons: 환각 관련 뉴런의 존재·영향·기원 (2025)
arXiv: [2512.01797](https://arxiv.org/abs/2512.01797)
- 환각을 신호하는 뉴런이 **전체의 0.1% 미만**으로 희소하게 존재 → 식별·예측 가능.
- 그 뉴런을 **억제/활성화**해 출력을 바꿀 수 있다(개입 지점).
- 단 개입은 **도메인 특이적** → 무턱대고 누르면 다른 도메인 일반화·창의가 손상될 수 있음.
- → "없앨 수 있는데 왜 안 없애나"의 실증적 답: 부작용(창의·일반화 손상) 때문.

---

## B. 추론(Reasoning) — 학습법에 따라 능력이 갈린다

### 5. Towards Large Reasoning Models: A Survey of Reinforced Reasoning (Xu 외, 2025)
arXiv: [2501.09686](https://arxiv.org/abs/2501.09686)
- RL + Chain-of-Thought으로 **좋은 추론 궤적을 시행착오로 탐색**.
- test-time에 **더 긴 중간 토큰("생각")**을 허용하면 추론 정확도가 크게 오름 (o1/DeepSeek-R1 계열).
- → 추론력은 모델 크기만이 아니라 **학습·추론 방법의 산물**.

### 6. Stop Overthinking: A Survey on Efficient Reasoning (2025)
arXiv: [2503.16419](https://arxiv.org/abs/2503.16419)
- 길게 생각하는 게 **항상 이득은 아님** — 과한 사고는 비용·지연·오류를 늘릴 수 있음.
- → "얼마나 생각하게 할지"도 설계 변수.

---

## C. "창발(Emergence)"은 진짜인가 — 측정이 결론을 바꾼다

### 7. Emergent Abilities of Large Language Models (Wei 외, 2022)
arXiv: [2206.07682](https://arxiv.org/abs/2206.07682)
- 작은 모델엔 없던 능력이 **규모를 키우면 예측 불가하게 창발**한다고 주장.

### 8. Are Emergent Abilities of LLMs a Mirage? (Schaeffer 외, 2023)
arXiv: [2304.15004](https://arxiv.org/abs/2304.15004)
- 창발은 **연구자의 metric 선택이 만든 착시**. 능력의 92%가
  Multiple-Choice/Exact-Match 같은 **불연속 지표**에서만 "갑툭튀"로 보임.
- 연속 지표로 보면 성능은 **매끄럽게 예측 가능**하게 증가.
- → **같은 데이터, 다른 지표 → 정반대 결론.** "버전·평가에 따라 이론이 달라진다"의 교과서 사례.

---

## 어떻게 공부할까 (밑바닥 이해 루트)

1. **개념 먼저**: [LLM이란 무엇인가](../llm/what-is-llm.md) — 토큰·attention·확률분포
2. **환각의 본질**: A-1 → A-3 (통계적 부산물 → 창의와의 트레이드오프)
3. **추론의 출처**: B-5 (RL+CoT가 추론을 만든다)
4. **비판적 시각**: C-7 vs C-8 (측정이 결론을 바꾼다 → 논문은 가정부터 본다)
5. **직접 구현**: [카파시 접근법](../llm/karpathy-approach.md) (nanoGPT 등)

## 관련 문서

- [LLM이란 무엇인가](../llm/what-is-llm.md) — hallucination, knowledge cutoff 기초
- [카파시 접근법](../llm/karpathy-approach.md) — 밑바닥부터 이해
- [모델별 비교](../llm/model-comparison.md)
