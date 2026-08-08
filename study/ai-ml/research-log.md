# 검색 기록 — AI / 머신러닝 학습

> `ai-ml/concept.md`를 작성하며 실제로 검색·확인한 기록.
> 목적: 출처 추적, NotebookLM 소스 재현, 나중에 다시 찾을 때 참고.

## 2026-07-15

### 검색 1 — 어텐션 원논문 & 해설
- **쿼리**: `"Attention Is All You Need" arxiv 1706.03762 Illustrated Transformer Jay Alammar`
- **찾은 핵심 소스**:
  - Vaswani 외(2017), *Attention Is All You Need* (원논문) — https://arxiv.org/abs/1706.03762
    - 저자: Ashish Vaswani, Noam Shazeer, Niki Parmar 외. RNN·CNN 없이 어텐션만으로 시퀀스 처리하는 Transformer 제안.
  - Jay Alammar, *The Illustrated Transformer* — https://jalammar.github.io/illustrated-transformer/
    - Stanford·Harvard·MIT 등 강의에서 인용되는 대표 시각 해설.
- **노트 반영**: 10·11단원(셀프·멀티헤드 어텐션, 트랜스포머).

### 검색 2 — 신경망 기초 무료 강의/책
- **쿼리**: `3Blue1Brown neural networks series Michael Nielsen neural networks and deep learning book d2l.ai`
- **찾은 핵심 소스**:
  - 3Blue1Brown, *Neural networks* (영상) — https://www.3blue1brown.com/topics/neural-networks
  - Michael Nielsen, *Neural Networks and Deep Learning* (무료 책, 2015) — http://neuralnetworksanddeeplearning.com/
  - *Dive into Deep Learning* (d2l.ai, 500여 대학 채택) — https://d2l.ai/
- **노트 반영**: 5~7단원(뉴런·순전파·역전파).

### 추가로 노트에 인용한 표준 자료 (기존에 알던 안정적 출처)
- Google, *Machine Learning Crash Course* — https://developers.google.com/machine-learning/crash-course
- Stanford CS231n — https://cs231n.github.io/
- Harvard NLP, *The Annotated Transformer* — https://nlp.seas.harvard.edu/annotated-transformer/
- Lilian Weng, *Attention? Attention!* — https://lilianweng.github.io/posts/2018-06-24-attention/
- Hugging Face, *NLP/LLM Course* — https://huggingface.co/learn/nlp-course/

## 2026-07-17

### 검색 3 — 층별 특화 검증 · 해석 가능성
- **쿼리**: `feature visualization Distill circuits Network Dissection linear probe BERT rediscovers NLP pipeline`
- **찾은 핵심 소스**:
  - Olah 외, *Feature Visualization* / *Zoom In: Circuits* (Distill) — https://distill.pub/2020/circuits/zoom-in/
  - Cammarata 외, *Curve Detectors* (Distill, 2020) — https://distill.pub/2020/circuits/curve-detectors/
  - Zeiler & Fergus (2014), *Visualizing and Understanding CNNs* — https://arxiv.org/abs/1311.2901
  - Bau 외, *Network Dissection* (2017) — https://arxiv.org/abs/1704.05796
  - Alain & Bengio, *Linear Classifier Probes* (2016) — https://arxiv.org/abs/1610.01644
  - Tenney 외, *BERT Rediscovers the Classical NLP Pipeline* (2019) — https://arxiv.org/abs/1905.05950
  - Ultralytics YOLO Docs — https://docs.ultralytics.com/
- **노트 반영**: [deep-layers-and-yolo.md](deep-layers-and-yolo.md) (깊이 트레이드오프 · 층별 특화 · 검증 3층위 · 레이어 제어 · YOLO 학습/사용 시점).

## 2026-08-08

### 검색 4 — YOLO vs SAM 2 (제로샷의 원리 · 모션 메모리)
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
- **노트 반영**: [deep-yolo-vs-sam.md](deep-yolo-vs-sam.md) (두 이념 · 제로샷 3개의 다리 · 메모리 기반 모션 · 성능 축 비교 · YOLO-World).
- **핵심 발견**: 제로샷의 열쇠는 데이터 규모가 아니라 **고정 크기 출력층(`Linear(..., num_classes)`) 병목의 제거**. SAM은 이름을 버려서, YOLO-World는 이름을 임베딩으로 옮겨서 같은 목적지에 도달. 또 SAM 2의 "모션 인식"은 옵티컬 플로우가 아니라 **기억 + cross-attention 대조**다.

### 검색 5 — 탄생 배경(역사) · 평가 지표 · 구조 진화 (같은 노트 확장)
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
- **노트 반영**: [deep-yolo-vs-sam.md](deep-yolo-vs-sam.md) 확장 — 1·2장(탄생 배경·목표·대가), 4장(SAM 1→2 진화), 7장(지표 읽는 법), 8장(오픈보캐뷸러리 계보), 9장(실전 코드·파이프라인), Q4·Q5 추가.
- **핵심 발견**: ① YOLO의 설계 목표(실시간·저비용·엣지)가 **그대로 남용 경로**(감시·군사)가 되어 창시자가 떠났다 — 목표와 위험은 같은 성질에서 나온다. ② `set_image()` / `predict()` 분리 같은 **API 모양이 곧 아키텍처(무거운 인코더 1회 + 가벼운 디코더 N회)** 다. ③ 실무 1순위 용도는 배포가 아니라 **라벨링 자동화** — SAM으로 라벨 만들고 가벼운 YOLO를 학습시켜 배포(시간축 분리).

## 다음에 더 파볼 것 (TODO)
- [x] RNN/LSTM 자체를 더 깊게 (게이트 구조) → [deep-rnn.md](deep-rnn.md)
- [x] 임베딩·토크나이저 실제 동작 (BPE) → [deep-embedding.md](deep-embedding.md)
- [x] 깊이·층별 특화·레이어 제어·YOLO → [deep-layers-and-yolo.md](deep-layers-and-yolo.md)
- [x] YOLO vs SAM 2 (제로샷 원리 · 모션 메모리) → [deep-yolo-vs-sam.md](deep-yolo-vs-sam.md)
- [x] 신경망 종류 한눈에(약어·의도·장단점) → [nn-types.md](nn-types.md)
- [x] 학습 신호·라벨·자기지도·확증편향 → [learning-signal.md](learning-signal.md)
- [x] 모델 편집·보안(PEFT/LoRA·ROME·MEMIT·백도어) → [model-editing-and-security.md](model-editing-and-security.md)
- [ ] RLHF / 파인튜닝 과정 상세
- [ ] 실제 파이썬 예제 코드로 미니 신경망 구현
- [ ] superposition / Sparse Autoencoder (겹친 특징 풀기)
