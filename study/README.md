# study — 학습 노트 모음

NotebookLM 업로드 및 복습용 상세 학습 노트. 각 폴더에 **학습 노트**와 **검색 기록(research-log)**이 있다.

## 목차

### 🧠 ai-ml/ — 인공지능 · 머신러닝
- [ml-attention-study-note.md](ai-ml/ml-attention-study-note.md) — 머신러닝 → 신경망 → 어텐션 → 트랜스포머 (12단원)
- [research-log.md](ai-ml/research-log.md) — 검색·출처 기록

### 🎨 graphics/ — 컴퓨터 그래픽스 (렌더링)
- [graphics-study-note.md](graphics/graphics-study-note.md) — 렌더링 → 파이프라인 → 조명 → 레이트레이싱 (13단원)
- [research-log.md](graphics/research-log.md) — 검색·출처 기록

### 🗺️ 학습 계획
- [roadmap.md](roadmap.md) — 개념 중심 학습 로드맵 (ML=Python, 그래픽스=브라우저→C++, 트랙별 도구 포함)
- [engineering-concepts-map.md](engineering-concepts-map.md) — "알아야 할 개념 지도" 재사용 렌즈(6카테고리): Java로 채우고 ML·그래픽스에 대입 (YAGNI·CI/CD·MLOps 등)

### 🔗 두 주제 잇기
- [graphics-vs-ml.md](graphics-vs-ml.md) — 컴퓨터 그래픽스 ↔ 머신러닝 비교와 융합

### 💬 lang/ — 언어를 개념으로 이해
- [lang/java-oop.md](lang/java-oop.md) — Java의 OOP·상속: 개념 → 어원(Simula·Smalltalk) → 철학(WORA)
- [lang/types-and-boxing.md](lang/types-and-boxing.md) — 정수 타입(비트≠자릿수)·원시vs래퍼·박싱→힙

### 🧮 cs/ — CS 핵심 & 면접 암기
- [cs/algorithms-and-abstraction.md](cs/algorithms-and-abstraction.md) — Big-O·자료구조 선택·추상화 강점과 약점 + CS 응용 Q&A
- [cs/unity-garbage-collection.md](cs/unity-garbage-collection.md) — Unity GC: 힙 반환 여부·Incremental·할당 줄이기
- [cs/qna/](cs/qna/) — **CS 암기 Q&A 40문항** (OS·네트워크·DB·자료구조), 3단 구조 · 📄 [cs-qna.html](cs/qna/cs-qna.html)

### 🎯 interview/ — 면접 준비
- [interview/explain-your-code.md](interview/explain-your-code.md) — 내 코드를 WHAT·HOW·TRADE-OFF 3단으로 설명하기

## 두 주제의 연결 고리
AI와 그래픽스는 모두 **GPU의 대량 병렬 연산**에 의존한다. 그래픽스용으로 발전한 GPU가 딥러닝 붐을 이끌었고, 반대로 AI가 렌더링(디노이징·DLSS)에 다시 쓰인다. 자세한 비교는 [graphics-vs-ml.md](graphics-vs-ml.md) 참고.

## 노트 공통 형식
- 부/단원 구조 · 각 단원 끝 **핵심 요약** + **참조 링크**
- 한↔영 **용어 사전**
- **NotebookLM 활용 팁** + 소스로 추가할 링크 모음
- 맨 끝 **전체 참조 출처**

_다음 주제 후보: RNN/LSTM 심화, GLSL 셰이더 실습, 강화학습, 3D 수학(선형대수)._
