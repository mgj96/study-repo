# 머신러닝 → 신경망 → 어텐션: 상세 학습 노트

> **용도**: NotebookLM 소스로 업로드해 요약·퀴즈·타임라인·개념정리에 활용.
> **읽는 순서**: 위에서 아래로 (개념이 계단식으로 쌓이도록 배치).
> **표기**: 한국어 설명 + (영어 용어). 각 단원 끝에 `참조` 링크 정리. 문서 맨 끝에 전체 출처 목록.
> **주의**: 이 노트는 개념 이해용 요약입니다. 정확한 수식·구현은 참조 원문을 확인하세요.

---

## 0. 큰 그림 (한 문단 요약)

컴퓨터는 원래 사람이 짜준 규칙만 따랐다. **머신러닝**은 규칙 대신 *예시(데이터)*를 주고 규칙을 스스로 찾게 하는 방법이다. 이 "규칙 찾기 기계"를 뇌의 뉴런처럼 층층이 쌓은 것이 **신경망(딥러닝)**이고, 신경망을 훈련시키는 핵심 알고리즘이 **역전파(경사하강)**다. 글·문장처럼 순서가 있는 데이터를 잘 다루기 위해 등장한 것이 **어텐션(attention)**이며, 어텐션만으로 쌓아 올린 구조가 **트랜스포머(Transformer)** — 오늘날 ChatGPT·Claude 같은 대형 언어 모델(LLM)의 뼈대다.

**학습 지도**

| 부 | 단원 | 한 줄 |
|----|------|-------|
| 1부 | 1. 머신러닝이란 | 예시로 규칙을 학습 |
| 1부 | 2. 학습의 종류 | 지도·비지도·강화 |
| 1부 | 3. 훈련·손실·경사하강 | 틀린 만큼 조금씩 고치기 |
| 1부 | 4. 일반화와 과적합 | 외우기 vs 이해하기 |
| 2부 | 5. 인공 뉴런 | 가중치×입력 + 활성화 |
| 2부 | 6. 신경망과 순전파 | 층을 통과하며 계산 |
| 2부 | 7. 역전파 | 오차를 거꾸로 되짚어 수정 |
| 3부 | 8. 순서 데이터의 문제 | 왜 RNN만으론 부족한가 |
| 3부 | 9. 어텐션 | 중요한 단어에 집중 |
| 3부 | 10. 셀프·멀티헤드 어텐션 | Q·K·V와 여러 손전등 |
| 3부 | 11. 트랜스포머 | 어텐션을 쌓은 구조 |
| 3부 | 12. LLM이 글을 쓰는 법 | 다음 토큰 예측 |

---

# 1부. 머신러닝 기초

## 1. 머신러닝이란 무엇인가

**정의.** 머신러닝(machine learning)은 명시적으로 규칙을 프로그래밍하지 않고, 데이터(예시)로부터 패턴·규칙을 자동으로 학습해 새로운 입력에 대해 예측·판단하는 기술이다.

**전통 프로그래밍 vs 머신러닝**

- 전통 방식: `규칙 + 입력 → 출력` (사람이 규칙을 작성)
- 머신러닝: `입력 + 출력(정답) → 규칙(모델)` (기계가 규칙을 학습)

**왜 필요한가.** "고양이를 알아보라" 같은 문제는 규칙을 일일이 적기가 사실상 불가능하다. 예외가 너무 많기 때문. 대신 고양이 사진을 수천 장 보여주면 모델이 공통 패턴을 스스로 추출한다.

**핵심 용어**
- **데이터셋(dataset)**: 학습에 쓰는 예시 모음.
- **특징(feature)**: 입력을 이루는 개별 정보(예: 사진의 픽셀, 집값 예측의 평수·위치).
- **레이블(label)**: 정답(예: "고양이", 실제 집값).
- **모델(model)**: 입력 → 출력을 계산하는 함수. 내부에 학습되는 **파라미터(parameter)**를 가짐.

**핵심 요약**: 머신러닝 = 규칙을 입력하는 대신 예시로 규칙을 학습한다.

`참조`: [Google ML Crash Course](https://developers.google.com/machine-learning/crash-course) · [위키백과: 기계 학습](https://ko.wikipedia.org/wiki/기계_학습)

## 2. 학습의 세 가지 종류

1. **지도학습(supervised learning)** — 입력과 *정답(레이블)*을 함께 준다. 대부분의 실무 예측(분류·회귀)이 여기 속한다.
   - *분류(classification)*: 정답이 카테고리 (스팸/정상, 개/고양이).
   - *회귀(regression)*: 정답이 숫자 (집값, 온도).
2. **비지도학습(unsupervised learning)** — 정답 없이 데이터만 준다. 비슷한 것끼리 묶는 *군집화(clustering)*, 차원을 줄이는 *차원축소* 등.
3. **강화학습(reinforcement learning)** — 정답 대신 *보상(reward)*을 준다. 시행착오로 보상을 최대화하는 행동을 학습. 게임 AI, 로봇 제어 등.

> LLM은 크게 (1) 방대한 텍스트로 다음 단어를 맞히는 **자기지도학습(self-supervised)** 사전학습 → (2) 사람 피드백 기반 강화학습(RLHF)으로 다듬는 단계를 거친다.

**핵심 요약**: 정답을 주면 지도, 안 주면 비지도, 보상을 주면 강화학습.

`참조`: [Google ML Crash Course – Framing](https://developers.google.com/machine-learning/crash-course/framing) · [위키백과: 지도 학습](https://ko.wikipedia.org/wiki/지도_학습)

## 3. 훈련·손실·경사하강

**훈련(training)이란** 모델의 파라미터를 조정해 예측이 정답에 가까워지게 만드는 과정이다.

**과정 3단계 (반복)**
1. **예측(forward)**: 현재 파라미터로 출력을 계산한다. 처음엔 엉터리.
2. **손실 계산(loss)**: 예측이 정답과 얼마나 다른지를 하나의 숫자로 잰다. 작을수록 좋다.
   - 회귀: 평균제곱오차(MSE). 분류: 교차엔트로피(cross-entropy).
3. **수정(update)**: 손실을 줄이는 방향으로 파라미터를 조금 바꾼다.

**경사하강법(gradient descent).** 손실을 파라미터에 대해 미분한 값(**기울기, gradient**)은 "손실이 가장 가파르게 커지는 방향"을 알려준다. 그 *반대 방향*으로 조금씩 이동하면 손실이 줄어든다.
- **학습률(learning rate)**: 한 번에 얼마나 이동할지. 너무 크면 발산, 너무 작으면 느림.
- 비유: 안개 낀 산에서 발밑 경사만 보고 가장 가파른 아래쪽으로 한 걸음씩 내려가 골짜기(최소 손실)를 찾는 것.

**핵심 요약**: 훈련 = (예측 → 손실 → 경사 반대로 조금 이동)을 수천~수백만 번 반복.

`참조`: [Google ML Crash Course – Reducing Loss](https://developers.google.com/machine-learning/crash-course/reducing-loss/gradient-descent) · [3Blue1Brown: Gradient descent](https://www.3blue1brown.com/lessons/gradient-descent)

## 4. 일반화와 과적합

**목표는 "외우기"가 아니라 "일반화(generalization)"** — 처음 보는 데이터에도 잘 맞히는 것.

- **과적합(overfitting)**: 훈련 데이터를 너무 통째로 외워, 새 데이터에서 성능이 떨어지는 현상. (시험 문제만 달달 외운 학생)
- **과소적합(underfitting)**: 모델이 너무 단순해 패턴조차 못 배운 상태.
- **데이터 분리**: 보통 데이터를 **훈련(train)/검증(validation)/테스트(test)**로 나눠, 못 본 데이터로 진짜 실력을 평가한다.
- **정규화(regularization)·드롭아웃(dropout)**: 과적합을 줄이는 대표 기법.

**핵심 요약**: 좋은 모델은 답을 외운 게 아니라 규칙을 이해해 새 문제도 푼다.

`참조`: [Google ML Crash Course – Generalization](https://developers.google.com/machine-learning/crash-course/generalization/peril-of-overfitting) · [위키백과: 과적합](https://ko.wikipedia.org/wiki/과적합)

---

# 2부. 신경망 (딥러닝)

## 5. 인공 뉴런 (퍼셉트론)

**뉴런 하나가 하는 일**: 여러 입력을 받아 각각 **가중치(weight)**를 곱하고, 전부 더한 뒤 **편향(bias)**을 더하고, **활성화 함수(activation)**를 통과시켜 하나의 출력을 낸다.

```
출력 = 활성화( (입력1×가중치1) + (입력2×가중치2) + ... + 편향 )
```

- **가중치**: 각 입력의 *중요도*. 학습으로 바뀌는 핵심 값.
- **편향**: 판단의 기준선을 이동시키는 값.
- **활성화 함수**: 비선형성을 넣어 복잡한 패턴을 표현하게 함. 없으면 아무리 층을 쌓아도 직선(1차식)밖에 못 만든다.
  - 대표: **ReLU**(0보다 작으면 0, 크면 그대로), **시그모이드(sigmoid)**(0~1), **소프트맥스(softmax)**(여러 후보의 확률 분포).

**핵심 요약**: 뉴런 = (입력×가중치 합 + 편향)을 활성화 함수로 변환. 가중치가 학습 대상.

`참조`: [Nielsen – Neural Networks and Deep Learning, Ch.1](http://neuralnetworksanddeeplearning.com/chap1.html) · [3Blue1Brown: But what is a neural network?](https://www.3blue1brown.com/lessons/neural-networks)

## 6. 신경망과 순전파

**신경망(neural network)**: 뉴런을 **층(layer)**으로 묶고, 층을 여러 개 이어 붙인 구조.
- **입력층(input)** → **은닉층(hidden)** (여러 개 가능) → **출력층(output)**.
- 은닉층이 많을수록 "깊다" → **딥러닝(deep learning)**.

**순전파(forward propagation)**: 입력이 층을 차례로 통과하며 계산되어 최종 출력이 나오는 과정.

**왜 깊게 쌓나**: 층이 깊어질수록 점점 추상적인 특징을 잡는다. (이미지: 1층=선/모서리 → 중간층=눈·코 → 깊은층=얼굴 전체) 이를 **표현 학습(representation learning)**이라 한다.

**핵심 요약**: 신경망 = 뉴런 층을 쌓은 것. 깊게 쌓으면 추상적 개념까지 학습.

`참조`: [Dive into Deep Learning (d2l.ai)](https://d2l.ai/) · [CS231n: Neural Networks](https://cs231n.github.io/neural-networks-1/)

## 7. 역전파 (Backpropagation)

**문제**: 층이 여러 개일 때, 각 가중치를 *얼마나* 고쳐야 손실이 줄까?

**역전파**: 출력에서 계산한 오차를 **뒤에서 앞으로** 미분(연쇄법칙, chain rule)으로 되돌리며, 각 가중치가 오차에 기여한 정도(기울기)를 구한다. 그 기울기로 경사하강을 적용해 모든 가중치를 동시에 조금씩 수정한다.

**과정**
1. 순전파로 출력·손실 계산.
2. 역전파로 각 가중치의 기울기 계산 (출력층 → 입력층 방향).
3. 경사하강으로 가중치 갱신.
4. 1~3을 데이터 배치마다 반복.

- 비유: "더 뜨거워/더 차가워" 게임. 결과가 틀린 책임을 뒤 층부터 앞 층으로 나눠주며 각자 고칠 방향을 알려준다.

**핵심 요약**: 역전파 = 연쇄법칙으로 오차를 거꾸로 전파해 모든 가중치의 수정 방향을 한 번에 구하는 알고리즘.

`참조`: [3Blue1Brown: Backpropagation](https://www.3blue1brown.com/lessons/backpropagation) · [Nielsen Ch.2 – How backpropagation works](http://neuralnetworksanddeeplearning.com/chap2.html) · [CS231n: Backprop](https://cs231n.github.io/optimization-2/)

---

# 3부. 어텐션과 트랜스포머

## 8. 순서(시퀀스) 데이터의 문제

문장·음성·시계열은 **순서**가 의미를 좌우한다. "개가 사람을 물었다" ≠ "사람이 개를 물었다".

**과거 방식 – RNN/LSTM**: 단어를 하나씩 순서대로 읽으며 "기억(은닉 상태)"을 갱신. 하지만 두 가지 한계:
1. **장거리 의존성**: 문장이 길면 앞 정보가 뒤까지 잘 전달되지 않음(기억이 희미해짐).
2. **병렬화 불가**: 순서대로 처리해야 해서 느림. (GPU를 충분히 못 씀)

→ 이 한계를 돌파하려고 **어텐션**이 등장했다.

**핵심 요약**: 순서 데이터는 장거리 관계 파악과 속도가 관건. RNN은 둘 다 약했다.

`참조`: [d2l.ai – RNN 장](https://d2l.ai/chapter_recurrent-neural-networks/) · [위키백과: LSTM](https://ko.wikipedia.org/wiki/장단기_기억)

## 9. 어텐션 (Attention) – 직관

**아이디어**: 한 단어를 이해할 때, 문장 속 *모든* 단어를 둘러보고 "어디에 얼마나 집중할지"를 점수로 정한다. 관련 깊은 단어에 높은 점수(집중)를 준다.

- 예: "그 **동물**은 길을 건너지 않았다. **그것**이 너무 피곤했기 때문이다."에서 "그것"을 해석할 때 "동물"에 강하게 집중.
- 비유: 손전등. 지금 처리하는 단어에서 관련 단어로 빛을 세게/약하게 비춘다. 빛의 세기 = **어텐션 가중치**.

**RNN과의 차이**: 순서대로 기억을 넘기지 않고, 모든 단어 쌍의 관계를 **한 번에 직접** 계산한다 → 장거리 관계도 즉시 연결, 병렬 처리도 가능.

**핵심 요약**: 어텐션 = 각 단어가 다른 모든 단어에 대한 "집중 점수"를 매겨 관계를 직접 파악.

`참조`: [Jay Alammar – The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) · [Lilian Weng – Attention? Attention!](https://lilianweng.github.io/posts/2018-06-24-attention/)

## 10. 셀프 어텐션과 멀티헤드 – 조금 더 자세히

**Query·Key·Value (질문·열쇠·값).** 각 단어는 세 벡터로 변환된다.
- **Query(Q)**: "나는 무엇을 찾고 있나?"
- **Key(K)**: "나는 어떤 정보를 갖고 있나?" (검색 태그)
- **Value(V)**: 실제 전달할 내용.

**계산 방식(셀프 어텐션)**
1. 한 단어의 Q를, 모든 단어의 K와 내적(dot product)해 **유사도 점수**를 구한다. (Q와 K가 잘 맞을수록 높은 점수)
2. 점수를 √(차원)으로 나눠 안정화하고(scaled), **소프트맥스**로 0~1 확률(집중 비율)로 변환한다.
3. 그 비율로 모든 단어의 **V를 가중합**해, 그 단어의 새 표현을 만든다.

수식 한 줄:
```
Attention(Q, K, V) = softmax( (Q · Kᵀ) / √dₖ ) · V
```

**셀프 어텐션(self-attention)**: Q·K·V가 모두 *같은 문장* 안에서 나온다 → 문장이 스스로를 들여다보며 내부 관계를 파악.

**멀티헤드 어텐션(multi-head attention)**: 손전등 하나가 아니라 여러 개(head)를 동시에 사용. 각 head가 서로 다른 관계를 담당(예: 문법 관계, 지시 대상, 의미 유사성). 결과를 합쳐 더 풍부하게 이해.

**핵심 요약**: 셀프 어텐션 = Q·K로 관련도 계산 → softmax로 집중 비율 → V를 가중합. 여러 head로 다양한 관계를 동시에 본다.

`참조`: [Attention Is All You Need (원논문, 2017)](https://arxiv.org/abs/1706.03762) · [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) · [The Annotated Transformer (Harvard)](https://nlp.seas.harvard.edu/annotated-transformer/)

## 11. 트랜스포머 (Transformer)

2017년 논문 *"Attention Is All You Need"*가 제안한 구조. RNN·CNN 없이 **어텐션만으로** 시퀀스를 처리한다. 병렬화가 잘 돼 대규모 학습이 가능해졌고, 오늘날 거의 모든 LLM의 바탕이 되었다.

**핵심 구성 요소**
- **토큰화(tokenization)**: 문장을 토큰(단어 조각) 단위로 쪼갬.
- **임베딩(embedding)**: 각 토큰을 의미를 담은 숫자 벡터로 변환.
- **위치 인코딩(positional encoding)**: 어텐션은 순서를 모르므로, 각 토큰에 "몇 번째인지"를 나타내는 위치 정보를 더해준다.
- **인코더/디코더 블록**: 각 블록 = 멀티헤드 어텐션 + 피드포워드 신경망(FFN). 여기에:
  - **잔차 연결(residual connection)**: 입력을 출력에 더해 깊은 층에서도 학습이 잘 되게 함.
  - **층 정규화(layer normalization)**: 값의 분포를 안정화.
- 이 블록을 **여러 층 쌓는다**(예: 수십~수백 층).

> 구조 갈래: 번역형은 인코더-디코더, GPT류 생성형은 **디코더-only**, BERT류 이해형은 **인코더-only**를 쓴다.

**핵심 요약**: 트랜스포머 = 임베딩+위치정보 → (멀티헤드 어텐션+FFN+잔차+정규화) 블록을 여러 층 쌓은 구조.

`참조`: [Attention Is All You Need](https://arxiv.org/abs/1706.03762) · [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) · [Hugging Face NLP Course](https://huggingface.co/learn/nlp-course/) · [위키백과: 트랜스포머](https://ko.wikipedia.org/wiki/트랜스포머_(기계_학습))

## 12. LLM이 글을 쓰는 법 – 다음 토큰 예측

**대형 언어 모델(LLM)**은 결국 "**지금까지의 토큰들을 보고, 다음에 올 토큰의 확률**"을 계산하는 트랜스포머다.
1. 입력 문장을 토큰으로 변환.
2. 트랜스포머가 다음 토큰 후보들의 확률 분포(softmax)를 출력.
3. 그중 하나를 골라(가장 높은 것 또는 확률적 샘플링) 문장 뒤에 붙인다.
4. 붙인 결과를 다시 입력으로 넣어 그다음 토큰을 예측… 이를 반복해 문장을 완성한다. (**자기회귀, autoregressive**)

- **온도(temperature)**: 샘플링의 무작위성 조절. 낮으면 안정적·반복적, 높으면 창의적·엉뚱.
- 사전학습(방대한 텍스트로 다음 토큰 맞히기) → 미세조정/RLHF(사람 선호에 맞추기) 순으로 훈련된다.

**핵심 요약**: LLM = "다음 토큰 확률"을 반복 예측해 글을 이어 쓰는 트랜스포머.

`참조`: [Hugging Face LLM Course](https://huggingface.co/learn/nlp-course/) · [3Blue1Brown: But what is a GPT?](https://www.3blue1brown.com/lessons/gpt)

---

## 한 줄 용어 사전 (한↔영)

| 한국어 | English | 뜻 |
|--------|---------|-----|
| 머신러닝 | machine learning | 예시로 규칙을 학습하는 기술 |
| 특징 | feature | 입력을 이루는 개별 정보 |
| 레이블 | label | 정답 |
| 파라미터 | parameter | 모델 내부에서 학습되는 값 |
| 손실 | loss | 예측과 정답의 차이(작을수록 좋음) |
| 경사하강 | gradient descent | 손실을 줄이는 방향으로 파라미터 이동 |
| 학습률 | learning rate | 한 번에 이동하는 크기 |
| 과적합 | overfitting | 훈련 데이터를 외워 새 데이터에 약함 |
| 가중치 | weight | 입력의 중요도 |
| 편향 | bias | 판단 기준선 이동 값 |
| 활성화 함수 | activation | 비선형성을 넣는 함수(ReLU 등) |
| 순전파 | forward propagation | 입력→출력 계산 |
| 역전파 | backpropagation | 오차를 거꾸로 전파해 기울기 계산 |
| 어텐션 | attention | 어디에 집중할지 점수로 정하기 |
| 셀프 어텐션 | self-attention | 문장이 스스로의 내부 관계 파악 |
| Q·K·V | query/key/value | 질문·열쇠·값 벡터 |
| 멀티헤드 | multi-head | 여러 관계를 동시에 보는 어텐션 |
| 임베딩 | embedding | 토큰을 의미 벡터로 변환 |
| 위치 인코딩 | positional encoding | 순서 정보를 더해줌 |
| 트랜스포머 | transformer | 어텐션 기반 신경망 구조 |
| 토큰 | token | 문장을 쪼갠 처리 단위 |
| 자기회귀 | autoregressive | 앞 결과로 다음을 예측·반복 |

---

## NotebookLM 활용 팁

1. **이 파일 + 아래 원문 링크들**을 함께 소스로 추가하면, NotebookLM이 교차 확인해 더 정확히 요약한다.
2. NotebookLM에 시켜볼 만한 것:
   - "이 노트를 5문항 퀴즈로 만들어줘 (정답 포함)"
   - "역전파를 초등학생에게 설명하듯 다시 써줘"
   - "머신러닝→트랜스포머 발전 타임라인을 표로 정리해줘"
   - "어텐션과 RNN의 차이를 비교 표로"
   - 오디오 개요(Audio Overview) 기능으로 팟캐스트처럼 듣기

### NotebookLM에 소스로 직접 추가하면 좋은 링크 (복사용)

```
https://developers.google.com/machine-learning/crash-course
https://www.3blue1brown.com/topics/neural-networks
http://neuralnetworksanddeeplearning.com/
https://d2l.ai/
https://cs231n.github.io/
https://arxiv.org/abs/1706.03762
https://jalammar.github.io/illustrated-transformer/
https://nlp.seas.harvard.edu/annotated-transformer/
https://lilianweng.github.io/posts/2018-06-24-attention/
https://huggingface.co/learn/nlp-course/
```

---

## 전체 참조 출처

**머신러닝 기초**
- Google, *Machine Learning Crash Course* — https://developers.google.com/machine-learning/crash-course
- 위키백과, *기계 학습* — https://ko.wikipedia.org/wiki/기계_학습

**신경망 / 딥러닝**
- 3Blue1Brown, *Neural networks* (영상 시리즈) — https://www.3blue1brown.com/topics/neural-networks
- Michael Nielsen, *Neural Networks and Deep Learning* (무료 책) — http://neuralnetworksanddeeplearning.com/
- Aston Zhang 외, *Dive into Deep Learning* — https://d2l.ai/
- Stanford CS231n, *Convolutional Neural Networks for Visual Recognition* — https://cs231n.github.io/

**어텐션 / 트랜스포머**
- Vaswani 외(2017), *Attention Is All You Need* (원논문) — https://arxiv.org/abs/1706.03762
- Jay Alammar, *The Illustrated Transformer* — https://jalammar.github.io/illustrated-transformer/
- Harvard NLP, *The Annotated Transformer* — https://nlp.seas.harvard.edu/annotated-transformer/
- Lilian Weng, *Attention? Attention!* — https://lilianweng.github.io/posts/2018-06-24-attention/
- Hugging Face, *NLP / LLM Course* — https://huggingface.co/learn/nlp-course/

_작성: 2026-07 · 개념 이해용 학습 노트 (정확한 수식·구현은 원문 확인). 링크는 접속 시점에 따라 변동될 수 있음._
