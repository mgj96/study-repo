# 부록 C AI·머신러닝 · C.8 랭킹 알고리듬과 정리

> 부록

## 들어가며

X(Twitter)의 For You 랭킹 알고리듬을 공개 소스 원문과 대조해 읽는다. 그 뒤에 AI·ML을 공부하며 남긴 검색 기록과 정리 Q&A를 둔다.

---

## 딥다이브 — X(Twitter) For You 랭킹 알고리듬 (공개 소스 원문 대조)

> 대조 대상: [`xai-org/x-algorithm`](https://github.com/xai-org/x-algorithm) @ `d0cef2f` (2026-08-20)
> 방법: 저장소를 직접 clone 하여 `home-mixer/params/param.rs`, `home-mixer/params/config.rs` 값을 1:1 대조
> 형식: 12살 요약 → 원문 수치 심화. 얕은 버전은 [C.1 큰 그림](c1-big-picture.md), [C.8 X 랭킹 알고리듬·정리](c8-ranking-and-log.md).
> 관련: [학습 신호·라벨·확증편향](c3-learning-signal-and-backprop.md) · [모델 편집·보안](c3-learning-signal-and-backprop.md) · [검색 기록](c8-ranking-and-log.md)

---

### 0. 30초 직관 — 추천은 "점수 매기기"다

피드에 뭘 띄울지 고르는 일은 결국 **후보마다 점수를 매기고 높은 순으로 줄 세우는 것**이다.

점수는 이렇게 만든다. "이 사람이 이 글에 좋아요를 누를 확률"을 모델이 예측하고, 거기에 "좋아요는 얼마나 값진가"라는 **가중치**를 곱한다. 리트윗도, 공유도, 신고도 똑같이 한다. 그렇게 나온 값들을 전부 더하면 그 글의 최종 점수다.

이번에 X가 공개한 것이 바로 **그 가중치 숫자들**이다. 그동안은 구조만 알려져 있었고 숫자는 몰랐다.

여기서 딱 하나만 기억하면 된다. **가중치는 "확률"에 곱해지는 값이지, "횟수"에 곱해지는 값이 아니다.** 이걸 헷갈리면 아래 4장의 유명한 오해에 그대로 빠진다.

---

### 1. 공개 경위

| 시점 | 내용 |
|---|---|
| 2026-01-20 | 1차 오픈소스 공개 (구조 중심) |
| 2026-08-13 | 확대 공개 — **파라미터 가중치 포함**, 코드베이스 약 10~15배 |

비공개로 남은 부분: Grok(Grox) 기반 규정위반 예측 프롬프트, 일부 botmaker 룰. 어뷰징 회피를 막기 위한 조치라고 밝힘.

---

### 2. 점수 계산 구조

```
최종 점수 = Σ ( weight_i × P(action_i) )
```

**핵심: 가중치는 `예측 확률`에 곱해집니다. 실제 행동 횟수(raw count)가 아닙니다.**

이 구분이 아래 4장 전체의 근거입니다.

---

### 3. 실제 가중치 값 (원문 대조 완료)

#### 3.1 양수 가중치 — `param.rs`

| 행동 | 값 | 위치 |
|---|---|---|
| 링크 복사 공유 | **20.0** | `ShareViaCopyLinkWeight` L358 |
| 답글 | **5.0** | `ReplyWeight` L315 |
| ↳ 상호팔로우 답글 부스트 | **+15.0** (실질 20.0) | `BidirectionalFollowReplyWeightBoost` L317 |
| 인용 | **5.0** | `QuoteWeight` L364 |
| DM 공유 | **5.0** | `ShareViaDmWeight` L352 |
| 작성자 팔로우 | **4.0** | `FollowAuthorWeight` L378 |
| 일반 공유 | **2.0** | `ShareWeight` L350 |
| 리트윗 | **1.0** | `RetweetWeight` L328 |
| 좋아요 | **0.5** | `FavoriteWeight` L314 |
| 클릭 | **0.4** | `ClickWeight` L341 |
| 링크 열기 | **0.2** | `OpenLinkWeight` L342 |
| 사진 확대 / 영상 재생 | **0.05** | `PhotoExpandWeight` L330, `VideoOpenWeight` L336 |
| 미탐색 게시물 보정 | **0.02** | `PostUnexploredWeight` L384 |
| **연속 체류시간** | **0.004** | `ContDwellTimeWeight` L408 |

#### 3.2 음수 가중치

| 행동 | 값 | 위치 |
|---|---|---|
| 신고 | **−234.0** | `ReportWeight` L474 |
| 음소거 | **−58.8** | `MuteAuthorWeight` L469 |
| 관심없음 | **−43.2** | `NotInterestedWeight` L457 |
| 차단 | **−31.2** | `BlockAuthorWeight` L463 |
| 미체류 | **−0.02** | `NotDwelledWeight` L476 |

> 음소거(−58.8)가 차단(−31.2)보다 **1.88배** 크다는 점은 사실.
> 차단은 그 사용자와의 관계를 끊는 개별 행위지만, 음소거는 "관계는 두되 콘텐츠만 싫다"는 신호라 콘텐츠 품질 판정에 더 직접적이기 때문으로 해석됨.

#### 3.3 값이 0인 것

| 항목 | 값 |
|---|---|
| 프로필 클릭 | `ProfileClickWeight = 0.0` |
| 체류(이진 플래그) | `DwellWeight = 0.0` |
| 클릭 후 체류시간 | `ContClickDwellTimeWeight = 0.0` |
| 인용글 영상재생 | `QuotedVqvWeight = 0.0` |

#### 3.4 구조 상수 — `config.rs`

| 항목 | 값 | 위치 |
|---|---|---|
| 게시물 최대 수명 | **48시간** | `MAX_POST_AGE = 48*60*60` L36 |
| 후보 선정 수 | **50** | `TOP_K_CANDIDATES_TO_SELECT` L17 |
| 실제 노출 수 | **35** | `RESULT_SIZE` L18 |
| 신규계정 외부글 계수 | **0.00001** | `NEW_USER_OON_WEIGHT_FACTOR` L38 |
| 신규계정 기준 팔로우 수 | **5개 미만** | `NEW_USER_MIN_FOLLOWING` L39 |
| 일반 미팔로우 글 할인 | **0.75** | `OonWeightFactor` (param.rs L253) |
| 토픽 미팔로우 글 할인 | **0.5** | `TopicOonWeightFactor` (param.rs L273) |

---

### 4. 널리 퍼진 두 가지 오해 — 정정

#### 오해 ① "신고 1건 = 좋아요 468개"

**소스코드 주석이 이 계산을 직접 반박합니다.** `param.rs` 가중치 블록 바로 위 주석 원문:

> *"One common misinterpretation is that you can read these weight ratios as count equivalences, e.g. the incorrect statement that "one report cancels 468 likes" -- this is incorrect because the weights apply to the predicted **probabilities** rather than raw counts. And the baseline probability of a Report is more than 1000x lower than a Like, so it's weighted more to allow the prediction to affect the final ranking at all."*

**해석:** 234 ÷ 0.5 = 468 이라는 산술은 맞지만, 두 값은 서로 다른 스케일의 확률에 곱해집니다. 신고의 기저 발생확률이 좋아요보다 1000배 이상 낮기 때문에, 계수를 키우지 않으면 랭킹에 **아예 반영조차 안 됩니다**. 큰 계수는 "파괴력"이 아니라 **스케일 정규화**입니다.

xAI가 이 오해를 예상하고 코드에 미리 못 박아 둔 것으로 보입니다.

#### 오해 ② "체류 시간 가중치는 0, 꺼져 있다"

**절반만 맞습니다.**

- `DwellWeight = 0.0` → 이진 체류 플래그**만** 꺼짐
- `ContDwellTimeWeight = 0.004` → **연속 체류시간은 켜져 있음**
- `NotDwelledWeight = −0.02` → **체류하지 않으면 감점**

즉 dwell 신호는 제거된 게 아니라 "이진 판정 → 연속값 가점 + 미체류 감점" 형태로 **재설계**된 것입니다. 좋아요(0.5)에 비하면 작지만 0이 아니며, 미체류 감점(−0.02)이 연속 가점(0.004)의 5배라는 점이 오히려 시사적입니다.

---

### 5. 요약 시사점

1. **공유 > 대화 > 팔로우 > 리트윗 > 좋아요** 순의 명확한 위계. 좋아요는 최하위권 양수 신호.
2. **링크 복사 공유(20.0)가 최고 양수** — 플랫폼 외부로 나가는 공유를 가장 높게 평가.
3. **상호팔로우 관계의 답글은 링크 복사와 동급(20.0)** — 관계 기반 대화에 강한 가중.
4. **부정 신호가 압도적** — 최고 양수(20.0) 대비 신고는 계수상 11.7배. 단, 4장 ① 참조하여 확률 스케일 차이를 반드시 함께 읽을 것.
5. **콜드스타트 절벽** — 팔로우 5개 미만이면 외부 글 계수가 0.00001. 신규 계정은 사실상 팔로우를 채우기 전까지 피드가 형성되지 않음.
6. **48시간 수명 + 50→35 필터** — 콘텐츠 회전이 매우 빠르고, 후보 30%가 노출 직전 탈락.

---

### 6. 재현 방법

```bash
git clone --depth 1 https://github.com/xai-org/x-algorithm.git
cd x-algorithm
grep -n "Weight" home-mixer/params/param.rs
cat home-mixer/params/config.rs
```

---

### 참고 자료

- [xai-org/x-algorithm (GitHub)](https://github.com/xai-org/x-algorithm) — 1차 출처
- [TechCrunch: X open sources its ranking algorithm](https://techcrunch.com/2026/08/13/x-open-sources-its-ranking-algorithm-letting-users-see-if-theyve-been-shadowbanned/)
- [explainx.ai: X Discloses Ranking Weights](https://explainx.ai/blog/x-algorithm-for-you-timeline-open-source-ranking-weights-august-2026)

> ⚠️ 2차 매체 기사들은 수치가 서로 엇갈립니다(2023년 구버전 가중치를 현행으로 소개하는 경우 다수). **반드시 저장소 원문을 기준으로 삼을 것.**

---

## 검색 기록 — AI / 머신러닝 학습

> `ai-ml/concept.md`를 작성하며 실제로 검색·확인한 기록.
> 목적: 출처 추적, NotebookLM 소스 재현, 나중에 다시 찾을 때 참고.

### 2026-07-15

#### 검색 1 — 어텐션 원논문 & 해설
- **쿼리**: `"Attention Is All You Need" arxiv 1706.03762 Illustrated Transformer Jay Alammar`
- **찾은 핵심 소스**:
  - Vaswani 외(2017), *Attention Is All You Need* (원논문) — https://arxiv.org/abs/1706.03762
    - 저자: Ashish Vaswani, Noam Shazeer, Niki Parmar 외. RNN·CNN 없이 어텐션만으로 시퀀스 처리하는 Transformer 제안.
  - Jay Alammar, *The Illustrated Transformer* — https://jalammar.github.io/illustrated-transformer/
    - Stanford·Harvard·MIT 등 강의에서 인용되는 대표 시각 해설.
- **노트 반영**: 10·11단원(셀프·멀티헤드 어텐션, 트랜스포머).

#### 검색 2 — 신경망 기초 무료 강의/책
- **쿼리**: `3Blue1Brown neural networks series Michael Nielsen neural networks and deep learning book d2l.ai`
- **찾은 핵심 소스**:
  - 3Blue1Brown, *Neural networks* (영상) — https://www.3blue1brown.com/topics/neural-networks
  - Michael Nielsen, *Neural Networks and Deep Learning* (무료 책, 2015) — http://neuralnetworksanddeeplearning.com/
  - *Dive into Deep Learning* (d2l.ai, 500여 대학 채택) — https://d2l.ai/
- **노트 반영**: 5~7단원(뉴런·순전파·역전파).

#### 추가로 노트에 인용한 표준 자료 (기존에 알던 안정적 출처)
- Google, *Machine Learning Crash Course* — https://developers.google.com/machine-learning/crash-course
- Stanford CS231n — https://cs231n.github.io/
- Harvard NLP, *The Annotated Transformer* — https://nlp.seas.harvard.edu/annotated-transformer/
- Lilian Weng, *Attention? Attention!* — https://lilianweng.github.io/posts/2018-06-24-attention/
- Hugging Face, *NLP/LLM Course* — https://huggingface.co/learn/nlp-course/

### 2026-07-17

#### 검색 3 — 층별 특화 검증 · 해석 가능성
- **쿼리**: `feature visualization Distill circuits Network Dissection linear probe BERT rediscovers NLP pipeline`
- **찾은 핵심 소스**:
  - Olah 외, *Feature Visualization* / *Zoom In: Circuits* (Distill) — https://distill.pub/2020/circuits/zoom-in/
  - Cammarata 외, *Curve Detectors* (Distill, 2020) — https://distill.pub/2020/circuits/curve-detectors/
  - Zeiler & Fergus (2014), *Visualizing and Understanding CNNs* — https://arxiv.org/abs/1311.2901
  - Bau 외, *Network Dissection* (2017) — https://arxiv.org/abs/1704.05796
  - Alain & Bengio, *Linear Classifier Probes* (2016) — https://arxiv.org/abs/1610.01644
  - Tenney 외, *BERT Rediscovers the Classical NLP Pipeline* (2019) — https://arxiv.org/abs/1905.05950
  - Ultralytics YOLO Docs — https://docs.ultralytics.com/
- **노트 반영**: [C.6 층별 특화와 YOLO](c6-layers-and-yolo.md) (깊이 트레이드오프 · 층별 특화 · 검증 3층위 · 레이어 제어 · YOLO 학습/사용 시점).

### 2026-08-08

#### 검색 4 — YOLO vs SAM 2 (제로샷의 원리 · 모션 메모리)
- **쿼리**: `SAM 2 SA-V dataset masklets memory attention memory bank architecture` / `SAM 2 object pointers occlusion head Hiera streaming` / `YOLO-World open-vocabulary zero-shot LVIS`
- **찾은 핵심 소스**:
  - Redmon 외(2016), *You Only Look Once* — https://arxiv.org/abs/1506.02640
    - 탐지를 회귀 문제로 재정의(one-stage). 기본 45 FPS, Fast YOLO 155 FPS.
  - Kirillov 외(2023), *Segment Anything* — https://arxiv.org/abs/2304.02643
    - 새 **과제 + 모델 + 데이터셋** 3종 세트. SA-1B = 이미지 1,100만 장 · 마스크 11억 개. 프롬프트 가능 설계 → 제로샷 전이.
  - Ravi 외(2024), *SAM 2: Segment Anything in Images and Videos* — https://arxiv.org/abs/2408.00714
    - 스트리밍 메모리 트랜스포머. 영상에서 상호작용 3배 감소, 이미지에서 SAM 대비 6배 빠름(A100 44 FPS). SA-V = 영상 50.9K · masklet 642.6K · 마스크 3,550만.
    - 메모리 뱅크: 최근 무프롬프트 프레임 `N=6` + 프롬프트 프레임 `M=1`, 특징 맵 + object pointer(256차원). Hiera(MAE 사전학습) 인코더, occlusion head.
  - Cheng 외(2024), *YOLO-World* — https://arxiv.org/abs/2401.17270
    - RepVL-PAN + region-text contrastive로 open-vocabulary화. LVIS 제로샷 35.4 AP · V100 52.0 FPS.
  - Ding 외(2024), *SAM2Long* (메모리 트리로 긴 영상 개선) — https://arxiv.org/abs/2410.16268
  - Encord, *SAM 2 & SA-V Dataset Explained* — https://encord.com/blog/segment-anything-model-2-sam-2/
- **노트 반영**: [C.7 YOLO vs SAM 2](c7-yolo-vs-sam.md) (두 이념 · 제로샷 3개의 다리 · 메모리 기반 모션 · 성능 축 비교 · YOLO-World).
- **핵심 발견**: 제로샷의 열쇠는 데이터 규모가 아니라 **고정 크기 출력층(`Linear(..., num_classes)`) 병목의 제거**. SAM은 이름을 버려서, YOLO-World는 이름을 임베딩으로 옮겨서 같은 목적지에 도달. 또 SAM 2의 "모션 인식"은 옵티컬 플로우가 아니라 **기억 + cross-attention 대조**다.

#### 검색 5 — 탄생 배경(역사) · 평가 지표 · 구조 진화 (같은 노트 확장)
> 사용자 요청: "처음 만들어진 이유·추구한 목표 중심으로, 흥미 위주로, 트레이드오프도 중요."
- **쿼리**: `Joseph Redmon quit computer vision 2020 ethical concerns` / `YOLO version lineage v4~v11 who made each, controversy` / `J&F DAVIS Jaccard F-measure Perazzi 2016` / `Hiera hierarchical ViT MAE Ryali 2023`
- **찾은 핵심 소스**:
  - Synced(2020-02), *YOLO Creator Stopped CV Research Due to Ethical Concerns* — https://syncedreview.com/2020/02/24/yolo-creator-says-he-stopped-cv-research-due-to-ethical-concerns/
    - Redmon이 **군사 활용·프라이버시 우려**로 CV 연구 중단 선언. "almost no upside and enormous downside risk". 이후 YOLO 버전 계보가 여러 팀으로 갈라진 배경.
  - *ODverse33: Is the New YOLO Version Always Better?* (2025) — https://arxiv.org/abs/2502.14314
    - 최신 버전이 항상 낫지는 않음. 도메인별 실측 필요. + Ultralytics 계열 **AGPL-3.0 라이선스** 이슈.
  - Ryali 외(2023), *Hiera* — https://arxiv.org/abs/2306.00989
    - vision-specific "bells-and-whistles"를 떼고 **MAE 사전학습으로 대체**. SAM 2가 ViT-H → Hiera로 간 이유(속도 + 다중 스케일).
  - Perazzi 외(2016), *DAVIS Benchmark* — https://davischallenge.org/
    - **J&F**: J=영역 IoU, F=경계 정확도. 큰 물체는 테두리가 틀려도 IoU가 잘 나오므로 경계 지표를 따로 둠.
  - facebookresearch/sam2 README (실제 API) — https://github.com/facebookresearch/sam2
  - Ultralytics SAM 2 Docs (크기·속도 벤치마크) — https://docs.ultralytics.com/models/sam-2/
    - SAM2-b 162 MB / 80.8M / CPU 28,867 ms/장 vs YOLO n-seg 6.7 MB / 2.7M / 25.2 ms/장 → **CPU 약 930배** 차이.
- **노트 반영**: [C.7 YOLO vs SAM 2](c7-yolo-vs-sam.md) 확장 — 1·2장(탄생 배경·목표·대가), 4장(SAM 1→2 진화), 7장(지표 읽는 법), 8장(오픈보캐뷸러리 계보), 9장(실전 코드·파이프라인), Q4·Q5 추가.
- **핵심 발견**: ① YOLO의 설계 목표(실시간·저비용·엣지)가 **그대로 남용 경로**(감시·군사)가 되어 창시자가 떠났다 — 목표와 위험은 같은 성질에서 나온다. ② `set_image()` / `predict()` 분리 같은 **API 모양이 곧 아키텍처(무거운 인코더 1회 + 가벼운 디코더 N회)** 다. ③ 실무 1순위 용도는 배포가 아니라 **라벨링 자동화** — SAM으로 라벨 만들고 가벼운 YOLO를 학습시켜 배포(시간축 분리).

### 다음에 더 파볼 것 (TODO)
- [x] RNN/LSTM 자체를 더 깊게 (게이트 구조) → [C.4 RNN·임베딩·어텐션](c4-sequence-and-attention.md)
- [x] 임베딩·토크나이저 실제 동작 (BPE) → [C.4 RNN·임베딩·어텐션](c4-sequence-and-attention.md)
- [x] 깊이·층별 특화·레이어 제어·YOLO → [C.6 층별 특화와 YOLO](c6-layers-and-yolo.md)
- [x] YOLO vs SAM 2 (제로샷 원리 · 모션 메모리) → [C.7 YOLO vs SAM 2](c7-yolo-vs-sam.md)
- [x] 신경망 종류 한눈에(약어·의도·장단점) → [C.2 학습 경로와 신경망 종류](c2-curriculum-and-nn-types.md)
- [x] 학습 신호·라벨·자기지도·확증편향 → [C.3 학습 신호와 역전파](c3-learning-signal-and-backprop.md)
- [x] 모델 편집·보안(PEFT/LoRA·ROME·MEMIT·백도어) → [C.3 학습 신호와 역전파](c3-learning-signal-and-backprop.md)
- [ ] RLHF / 파인튜닝 과정 상세
- [ ] 실제 파이썬 예제 코드로 미니 신경망 구현
- [ ] superposition / Sparse Autoencoder (겹친 특징 풀기)

---

## 정리 Q&A

### AI · 머신러닝 — 암기 Q&A (얕게)

> 형식: **① 결론·WHAT / ② 원리·HOW / ③ 확장·TRADE-OFF**. 쉬운 말 위주. 심화는 물어보면 더 파기.
> 개념 상세: [C.1 큰 그림](c1-big-picture.md)

---

#### Q1. 머신러닝이 뭐야? 보통 프로그램이랑 뭐가 달라?
- **① 결론** 규칙을 사람이 안 짜고, **예시(데이터)로 스스로 규칙을 배우는** 프로그램.
- **② 원리** 고양이 사진을 잔뜩 보여주면 "이런 게 고양이구나"를 알아서 찾아낸다.
- **③ 확장** 규칙 적기 불가능한 문제(사진·말)에 강함. 대신 **데이터가 많이** 필요하고 왜 그렇게 판단했는지 알기 어렵다.

#### Q2. 신경망이 뭐야?
- **① 결론** 작은 계산기(뉴런)를 **층층이 쌓은** 구조. 뇌를 흉내 냄.
- **② 원리** 입력에 중요도(가중치)를 곱해 더하고, 다음 층으로 넘긴다. 깊게 쌓으면 딥러닝.
- **③ 확장** 깊을수록 복잡한 걸 배우나, 데이터·계산이 많이 든다.

#### Q3. 학습(훈련)은 어떻게 해?
- **① 결론** 틀린 만큼 조금씩 고치기를 **엄청 많이 반복**.
- **② 원리** 예측 → 정답과 차이(오차) 확인 → 오차 줄는 방향으로 가중치 살짝 수정(경사하강).
- **③ 확장** 너무 외우면 새 문제에 약함(과적합). 그래서 못 본 데이터로 시험해본다.

#### Q4. 어텐션(attention)이 뭐야?
- **① 결론** 문장에서 **중요한 단어에 집중**하는 방법.
- **② 원리** 각 단어가 다른 모든 단어를 둘러보고 "누구에게 집중할지" 점수를 매긴다(손전등처럼).
- **③ 확장** 멀리 떨어진 단어 관계도 바로 연결하고 병렬 처리가 빨라, 요즘 챗봇의 핵심이 됨.

#### Q5. GPT 같은 게 글을 어떻게 써?
- **① 결론** **다음에 올 단어**를 계속 예측해서 이어 쓴다.
- **② 원리** 지금까지 문장을 보고 다음 단어 확률을 계산 → 하나 골라 붙이고 → 반복(자기회귀).
- **③ 확장** 온도(temperature)로 창의성 조절. 사실을 "그럴듯하게" 지어낼 수도 있어 검증이 필요.

#### Q6. 왜 신경망을 깊게 쌓아? 얕으면 안 돼?
- **① 결론** 깊으면 아래층 조각을 **재사용**해 **적은 파라미터**로 복잡한 걸 표현. 얕으면 파라미터가 폭발해 **메모리가 커진다.**
- **② 원리** 층을 하나 더 쌓으면 표현력이 지수적으로 늘어 (선→부품→물체 조합). 같은 표현력을 얕게 내려면 폭을 지수적으로 넓혀야 함.
- **③ 확장** 깊이의 비용은 "연산량"이 아니라 **순서대로 통과하는 지연(latency)** 과 **기울기 소실**(→ ResNet skip connection으로 해결).

#### Q7. "각 층이 선·눈·얼굴을 담당"한다는데 진짜야? 어떻게 확인해?
- **① 결론** 진짜다. 낮은 층=단순(선), 깊은 층=추상(얼굴)으로 **학습이 알아서** 나뉜다. "그냥 그렇게 보이는 것" 아니냐는 의심은 **검증으로** 깨졌다.
- **② 원리** ① 프로브·시각화로 **관찰** → ② 유닛을 꺼서(ablation) **인과 확인** → ③ 다른 망에서도 같은 특징 재등장(**보편성**). 3중으로 검증.
- **③ 확장** 단, 한 뉴런이 여러 개념을 겹쳐 담아(**superposition**) 경계는 흐릿. 요즘은 이걸 푸는 연구(SAE)가 활발.

#### Q8. 레이어를 하나씩 따로 제어할 수 있어?
- **① 결론** **구조·동결·학습률·관찰·교체**는 층별로 직접 됨. 단 **"이 층은 눈 담당"** 같은 의미 지정은 직접 불가(유도만).
- **② 원리** PyTorch에서 `requires_grad=False`로 동결, 층별 학습률 지정, `register_forward_hook`으로 출력 관찰, 마지막 층 교체 등.
- **③ 확장** 보통 층 하나가 아니라 **블록 그룹** 단위로 다루고, 층별 미세제어는 **전이학습·디버깅·LoRA** 같은 특정 목적에서만 (YAGNI).

#### Q9. YOLO 같은 걸 "가져다 쓴다"는 게 무슨 뜻이야?
- **① 결론** 누가 **학습을 끝내둔 가중치(`.pt`)로 추론(forward)만** 하는 것. 학습 시점엔 레이어+경사하강으로 만든 결과물이다.
- **② 원리** **학습 시점** = 라벨 데이터로 backbone·head 가중치를 경사하강으로 맞춤. **사용 시점** = 그 가중치 로드 후 forward만 (경사하강 없음).
- **③ 확장** 내 전용 클래스면 **head만 교체해 파인튜닝**(전이학습). from scratch는 데이터·GPU가 많이 들어 드묾.

#### Q10. 이미지는 사람이 라벨 다는데, 글씨는 정답을 어떻게 얻어?
- **① 결론** 글은 대부분 **데이터가 스스로 정답을 만든다(자기지도학습)**. 사람이 라벨 안 달아도 됨.
- **② 원리** "나는 밥을 ___ → 먹었다"처럼 **다음 단어를 가리고 맞히기.** 정답이 이미 글 안에 있어, 인터넷 글 전체가 공짜 문제집.
- **③ 확장** 음성·영상·그림도 "일부 가리고 맞히기" 또는 이미지-캡션 짝(CLIP)으로 배움. 라벨 비용 0 → LLM 폭발의 원동력. (→ [C.3 학습 신호와 역전파](c3-learning-signal-and-backprop.md))

#### Q11. 계속 자기 결과로 학습하면 확증편향에 빠지는 거 아냐?
- **① 결론** 기본은 아님. 조정 기준이 **자기 확신이 아니라 외부 정답(닻)** 이라, 아무리 확신해도 정답과 다르면 깎인다 → **진실로 수렴.**
- **② 원리** 눈 감고 활을 쏘지만 "정답이 5cm 왼쪽"이라 알려주는 게 라벨. 자기 느낌이 아니라 **바깥 사실**로 고친다.
- **③ 확장** 단, **정답이 편향되거나·자기 출력으로 배우거나(모델 붕괴)·추천 루프(필터버블)·아첨(sycophancy)** 이면 진짜 확증편향으로 증폭. "진실이냐 편향이냐"는 **닻이 현실에 붙었나**에 달림.

_더 깊이(논문 기반): **[C.6 층별 특화와 YOLO](c6-layers-and-yolo.md)** (깊이·층별 특화·레이어 제어·YOLO) · **[C.4 RNN·임베딩·어텐션](c4-sequence-and-attention.md)** (어텐션·트랜스포머) · **[C.3 학습 신호와 역전파](c3-learning-signal-and-backprop.md)** (신경망·역전파 수학). 정답/라벨 참고: **[C.3 학습 신호와 역전파](c3-learning-signal-and-backprop.md)**._

---

## 다음으로

ML과 가장 닮은 이웃 분야, 컴퓨터 그래픽스로 간다.

👉 [부록 D 그래픽스와 Unity · D.1 컴퓨터 그래픽스](d1-graphics.md)
