# ML 커리큘럼 — 개념 우선 하이브리드 (teddylee777 검수 반영)

> 출발: [teddylee777/machine-learning](https://github.com/teddylee777/machine-learning) 커리큘럼을 검수해, **사용자 학습 스타일(개념 우선 top-down) + 2026 현대화**로 재구성.
> 원칙: **개념 먼저 → 바로 실습**, 수학·통계는 **just-enough**(필요할 때 판다). 관련: [roadmap.md](../roadmap.md) · [concept.md](concept.md) · [nn-types.md](nn-types.md).

---

## 0. 이 커리큘럼의 3원칙

1. **개념 먼저(top-down)**: teddylee777은 수학·pandas를 한참 한 뒤 재미있는 걸 만지는 bottom-up. 우리는 **개념을 먼저 잡고**, 그 개념에 필요한 실습·수학을 **뒤에 바로** 붙인다. (동기 유지)
2. **just-enough 수학/통계**: 다 배우고 시작하지 않는다. 개념이 요구할 때 **그 조각만** 판다. (단, 아래 §수학·통계에 지도를 둠)
3. **2026 현대화**: **PyTorch 우선**, LLM/Transformer 비중↑, 낡은 것은 과감히 스킵.

---

## ✂️ 스킵 / 미루기 리스트 (검수 결과)

| 항목 | 처리 | 이유 |
|------|------|------|
| **TensorFlow 1.x** (`03-TensorFlow`) | ❌ 스킵 | 사실상 폐기 기술. PyTorch로 대체 |
| TF 1.x 기반 강의 | ❌ 스킵 | 위와 동일 |
| **meta / active / federated / incremental learning** | ❌ 스킵 | 연구 니치. 입문에 불필요 |
| **AutoML / NAS**(`11-AutoML`) 깊이 | ⏳ 미루기 | 나중에 도구로 충분. 지금 원리 학습에 방해 |
| **XAI**(`08-XAI`) 별도 챕터 | ⏳ 미루기 | 이미 [deep-layers-and-yolo.md](deep-layers-and-yolo.md) 검증 절에서 다룸 |
| **강화학습**(`10-RL`) | ⏳ 전문화 단계로 | 별도 트랙. 기초 끝난 뒤 택1 |
| TensorFlow 2.0 | 🔁 선택 | PyTorch 하면 굳이 둘 다 안 해도 됨 |

> 핵심: **PyTorch 한 우물**, RL·AutoML·XAI는 기초 다진 뒤 선택.

---

## 📐 단계별 커리큘럼

### 0단계 · 수학·통계 (just-enough) — **보완 강화** (아래 §상세)
개념이 막힐 때 돌아와 그 조각만 판다. 처음부터 완주 X.

### 1단계 · Python / NumPy (최소)
- 목표: 개념을 **실험할 만큼만**. Java 하셨으면 며칠.
- 실습: `00-Python`, NumPy 기초. 환경은 **Google Colab**(설치 0, 무료 GPU).

### 2단계 · 고전 ML (신규 — 신경망 앞에) 🆕
신경망으로 바로 점프하지 말고, **고전 ML을 개념으로** 먼저. "왜 신경망이 필요한가"를 체감하게 됨.
- **선형/로지스틱 회귀** → 예측·분류의 원형, 손실·경사하강의 첫 무대.
- **결정 트리 / 랜덤 포레스트** → 규칙 기반, 해석 쉬움. (표 데이터 강자)
- **SVM, KNN** → 경계 긋기·이웃 투표.
- **K-means 군집화 / PCA** → 비지도, 차원 축소.
- 실습: `07-Scikit-Learn`. 자료: Andrew Ng 강의, Hands-On ML 책.
- → 이 단계를 [concept.md](concept.md) 앞부분(1~4장)과 연결.

### 3단계 · 신경망 ~ 트랜스포머 (이미 있는 개념 노트 활용)
- 순서: 뉴런·순전파 → 역전파 → 어텐션 → 트랜스포머.
- **이미 정리됨**: [concept.md](concept.md), [nn-types.md](nn-types.md), [learning-signal.md](learning-signal.md), 딥다이브([backprop](deep-neural-backprop.md)·[attention](deep-attention.md)·[layers-yolo](deep-layers-and-yolo.md)).
- 실습: **PyTorch**로 미니 신경망 직접 구현(→ research-log TODO). `02-PyTorch`.

### 4단계 · 전문화 (택1)
- **NLP**: 임베딩·seq2seq·BERT → [deep-embedding.md](deep-embedding.md). `12-HuggingFace`.
- **컴퓨터 비전**: CNN·YOLO·세그멘테이션 → [deep-layers-and-yolo.md](deep-layers-and-yolo.md). CS231n.
- **강화학습**: Q-러닝·정책경사. 김성훈 RL, David Silver.

### 5단계 · LLM · 파인튜닝 (현대 비중↑)
- 사전학습(자기지도) → 파인튜닝 → **RLHF** (→ [learning-signal.md](learning-signal.md)).
- 실습: HuggingFace `transformers`, LangChain, OpenAI/Claude API. `13-ChatGPT`.

### 실전 (병행)
- **Kaggle**: 타이타닉 → Bike Sharing → Dogs vs Cats → Disaster Tweets. `01-Kaggle`.

---

## 📊 수학·통계 상세 (보완) — "왜 필요한가"와 함께

> 통째로 완주하지 말고, **개념이 요구하는 조각만** 골라 판다. 각 항목에 **"ML 어디서 쓰나"** 를 붙였다.

### A. 선형대수 (ML·그래픽스 공통 뿌리)
| 개념 | ML에서 어디에 |
|------|--------------|
| 벡터·행렬 곱 | 층 연산 자체(가중치 곱) |
| **내적(dot product)** | **어텐션 Q·K 점수**, 코사인 유사도(벡터 검색) |
| 기저·선형변환 | "행렬 곱 = 특징을 변환한다" |
| **고유값·고유벡터** | **PCA 차원 축소** |
- 자료: **3Blue1Brown, Essence of Linear Algebra**(직관 최고).

### B. 미적분 (학습의 심장)
| 개념 | ML에서 어디에 |
|------|--------------|
| 미분·기울기(gradient) | **경사하강** — 오차 줄이는 방향 |
| **편미분** | 여러 가중치 각각의 책임 |
| **연쇄법칙(chain rule)** | **역전파** 바로 그 원리 |
- 자료: 3Blue1Brown, Essence of Calculus.

### C. 확률·통계 (데이터·불확실성) 🆕 보완
| 개념 | ML에서 어디에 |
|------|--------------|
| 평균·분산·표준편차 | 정규화, 데이터 이해 |
| **조건부확률·베이즈 정리** | 나이브 베이즈, 불확실성 추정 |
| 분포(정규·이항·포아송·균등) | 가중치 초기화, 노이즈 모델(Diffusion) |
| 표본·신뢰구간·**p-value·가설검정** | 실험 평가, A/B 테스트 |
| **정보이론: 엔트로피·크로스엔트로피** | **분류 손실 함수** 그 자체 |
| (선택) 시계열 AR·MA·ARIMA | 시계열 예측(전문화 단계) |
- 자료: **StatQuest(Josh Starmer)** — 통계 직관 최고, 이 스타일과 잘 맞음. "공돌이의 수학정리노트", "손으로 푸는 확률분포".

> **연결 팁**: 크로스엔트로피 = "정답 분포와 예측 분포가 얼마나 다른가"(→ [learning-signal.md](learning-signal.md)의 정답 신호). 베이즈 = "증거로 믿음을 갱신"(확증편향 반대편).

---

## 🗺️ 자료 지도 (검수 후 엄선)

| 목적 | 추천 (현대화 반영) |
|------|-------------------|
| 수학 직관 | 3Blue1Brown(선대·미적분) |
| 통계 직관 | **StatQuest** |
| 고전 ML | Andrew Ng(Coursera), Hands-On ML 책 |
| 딥러닝 | 김성훈 "모두를 위한 딥러닝", Dive into Deep Learning |
| 비전 | Stanford CS231n |
| 실습 환경 | **Google Colab**(무료 GPU) |
| 프레임워크 | **PyTorch** (TF는 선택) |
| LLM | HuggingFace 코스, LangChain |
| 실전 | Kaggle |

---

## 추천 페이싱 (한 줄)

> **개념(우리 노트) → 그 개념에 필요한 수학 조각 → 사이킷런/PyTorch 실습 → Kaggle** 를 한 사이클로 돌린다. 수학·통계는 미리 완주하지 말고 **막힐 때 §상세에서 꺼내 판다.**

_검수 기준: teddylee777/machine-learning (2026-07 접속). TF1.x 등 낡은 항목 스킵, 수학·통계 보완, LLM 비중 상향._
