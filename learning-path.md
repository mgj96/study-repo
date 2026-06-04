# 학습 로드맵 — 바닥부터 LLM까지

> 목적: "겉만 보는" 학습을 벗고, **정석(Big-O·알고리즘)부터 한 단계씩 쌓아 LLM 내부까지**
> 이해한다. 각 단계는 앞 단계를 전제로 한다. [작성됨]은 이 레포에 있는 문서, [예정]은 만들 것.
>
> 학습 원칙(카파시): **읽기 < 직접 도출/구현.** 각 단계 끝에 "손으로 해보기"를 둔다.

## 왜 이 순서인가

```
수학 토대 → 알고리즘/복잡도 → 자료구조 → CS 시스템
        → LLM 수학 → LLM 내부 → 실습(구현)
```
LLM의 attention은 결국 **벡터 내적 + softmax(확률)** 이고, 그 효율은 **복잡도(Big-O)** 로
따진다. 즉 LLM을 깊이 이해하려면 수학·알고리즘이 먼저다. 건너뛰면 또 "겉"만 보게 된다.

---

## Phase 0 — 사고·수학 토대
- [예정] 로그·지수 직관 (왜 O(log n)이 빠른가의 뿌리)
- [예정] 확률·통계 기초 (LLM은 확률 모델 — 다음 토큰 분포)
- [예정] 선형대수 기초 (벡터·행렬·내적 → attention의 재료)
- 손으로: 로그 그래프 그려보기, 주사위 확률 계산

## Phase 1 — 알고리즘 정석
- [작성됨] **[Big-O 표기](algorithms/big-o-notation.md)** ← 여기서 시작
- [예정] 정렬 (버블→병합→퀵, 왜 O(n log n)이 한계인가)
- [예정] 탐색 (선형 vs 이진, 전제: 정렬)
- [예정] 재귀·분할정복
- [예정] 동적계획법(DP)
- [예정] 그래프 탐색(BFS/DFS)
- 손으로: 정렬 직접 구현 후 입력 크기별 시간 측정

## Phase 2 — 자료구조
- [작성됨] [시간복잡도·자료구조](cs-fundamentals/time-complexity-and-data-structures.md) (직관·실무)
- [예정] 배열/링크드리스트/스택/큐 정석
- [예정] 해시테이블 (충돌·리사이즈)
- [예정] 트리·힙·균형트리(B-tree → DB 인덱스로 연결)
- 손으로: 해시맵 직접 구현, 충돌 처리

## Phase 3 — CS 시스템 (하드웨어 의식)
- [작성됨] [메모리 계층과 지연시간](cs-fundamentals/memory-hierarchy-and-latency.md)
- [작성됨] [동시성 vs 병렬성](cs-fundamentals/concurrency-vs-parallelism.md)
- [작성됨] [프로세스/스레드·OS 기초](cs-fundamentals/process-thread-os-basics.md)
- [작성됨] [네트워크 기초](cs-fundamentals/networking-basics.md)
- [작성됨] [Scale-up vs Scale-out](cs-fundamentals/scaling-up-vs-out.md)

## Phase 4 — LLM 수학 토대
- [예정] 임베딩·벡터 유사도 (내적·코사인)
- [예정] softmax·확률분포·엔트로피 (왜 temperature가 분포를 바꾸나)
- [예정] 경사하강·역전파 직관 (모델이 "학습"한다는 것)
- 손으로: softmax 직접 계산, 코사인 유사도 계산

## Phase 5 — LLM 내부
- [작성됨] [LLM이란 무엇인가](llm/what-is-llm.md)
- [예정] 토큰화·임베딩 상세
- [예정] **Attention 정석** (Q·K·V, 왜 이렇게 설계됐나)
- [예정] Transformer 블록 조립
- [작성됨] [RLHF/RLAIF 정렬](concepts/rlhf-rlaif-alignment.md)
- [작성됨] [MoE](concepts/mixture-of-experts.md)
- [작성됨] [환각·추론·창발 논문](papers/hallucination-reasoning-emergence.md)

## Phase 6 — 실습 (카파시식 구현)
- [예정] micrograd 따라 만들기 (역전파 100줄)
- [예정] nanoGPT 따라 만들기 (GPT 300줄)
- [작성됨] 트레이드오프 실측 — [lab-benchmarks](https://github.com/mgj96/lab-benchmarks):
  Redis락 vs DB락 동시 재고차감을 Docker로 직접 돌려 숫자로 본다 (④단계 실습)

---

## 진행 방식 — 이해의 깊이 단계

```
얕음 →  ① 읽기 (요약·NotebookLM)            "그렇구나"
        ② 내 말로 다시 쓰기                  "설명할 수 있다"
        ③ 손으로 예제 따라가기               "따라간다"
깊음 →  ④ 문제를 직접 풀고 측정/구현해본다   "만들 수 있다, 왜 그런지 안다"
```

> **가장 깊은 단계는 ④ — 문제를 직접 작업해보고 결과를 보는 것.**
> 읽고 들은 건 휘발된다. 직접 풀다 막히고, 측정이 예측과 다를 때 진짜 이해가 박힌다.
> 그래서 각 문서 끝에 **"직접 풀어보기"** 문제를 둔다. 답을 보기 전에 손으로 먼저.

진행 1세트 = **읽기 → 내 말 요약 → 직접 풀기/구현 → (막히면 원본·논문으로)**.
NotebookLM은 ①②(복습·질문)용 도구일 뿐, 깊이는 ④에서 나온다.

## 관련 문서

- [카파시 접근법](llm/karpathy-approach.md) — 왜 직접 구현하나
- [트레이드오프 읽는 법](tradeoffs/reading-tradeoffs-and-metrics.md)
