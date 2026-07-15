# 검색 기록 — AI / 머신러닝 학습

> `ml-attention-study-note.md`를 작성하며 실제로 검색·확인한 기록.
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

## 다음에 더 파볼 것 (TODO)
- [ ] RNN/LSTM 자체를 더 깊게 (게이트 구조)
- [ ] 임베딩·토크나이저 실제 동작 (BPE)
- [ ] RLHF / 파인튜닝 과정 상세
- [ ] 실제 파이썬 예제 코드로 미니 신경망 구현
