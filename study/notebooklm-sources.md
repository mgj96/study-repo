# 📚 NotebookLM 소스 모음 (한 곳)

> NotebookLM에 넣을 **문서 경로**와 **외부 링크**를 한 곳에 모았다.
> 사용법: (1) 아래 `.md` 파일들을 소스로 업로드 → (2) 관련 외부 링크도 URL 소스로 추가하면 교차검증돼 요약·퀴즈 품질↑.

---

## 1. 저장소 문서 (소스로 업로드)

### 상위·계획
- `study/roadmap.md` — 학습 로드맵
- `study/engineering-concepts-map.md` — 6렌즈 개념 지도
- `study/graphics-vs-ml.md` — 그래픽스↔ML 비교
- `study/CONVENTIONS.md` — 형식 표준

### AI · 머신러닝
- `study/ai-ml/concept.md` — ML→신경망→어텐션→트랜스포머
- `study/ai-ml/research-log.md`

### 컴퓨터 그래픽스
- `study/graphics/concept.md` — 렌더링→파이프라인→레이트레이싱
- `study/graphics/research-log.md`

### CS 핵심
- `study/cs/concept.md` — Big-O·자료구조·추상화
- `study/cs/qna/os.md · network.md · database.md · ds-algorithm.md` — 암기 Q&A 40문항

### 언어
- `study/lang/java/concept.md` · `types-boxing.md` · `qna.md` — Java
- `study/lang/csharp/concept.md` · `qna.md` — C# (Java의 사촌)

### Unity
- `study/unity/concept.md` · `qna.md` — Unity GC 등

> 각 주제 `qna.md`는 3단 암기용. `concept.md`는 서술형 학습용.

### 면접
- `study/interview/explain-your-code.md` — WHAT·HOW·TRADE-OFF

---

## 2. 외부 링크 (URL 소스로 추가)

### 머신러닝
```
https://developers.google.com/machine-learning/crash-course
https://www.3blue1brown.com/topics/neural-networks
http://neuralnetworksanddeeplearning.com/
https://d2l.ai/
https://arxiv.org/abs/1706.03762
https://jalammar.github.io/illustrated-transformer/
https://huggingface.co/learn/nlp-course/
```

### 컴퓨터 그래픽스
```
https://learnopengl.com/
https://www.scratchapixel.com/
https://thebookofshaders.com/
https://raytracing.github.io/
https://www.khronos.org/opengl/wiki/Rendering_Pipeline_Overview
```

### CS·소프트웨어 개념
```
https://www.bigocheatsheet.com/
https://www.joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/
https://martinfowler.com/bliki/Yagni.html
https://en.wikipedia.org/wiki/Object-oriented_programming
```

### Java / Unity
```
https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html
https://docs.unity3d.com/6000.1/Documentation/Manual/performance-garbage-collector.html
```

---

## 3. NotebookLM에 시킬 것 (프롬프트 예시)
- "이 소스들로 CS 면접 예상질문 20개와 3단(결론·원리·확장) 모범답안을 만들어줘"
- "머신러닝→트랜스포머 발전 타임라인을 표로"
- "그래픽스와 ML이 GPU를 공유하는 이유를 중학생 눈높이로"
- "오디오 개요(팟캐스트)로 만들어줘"

_이 파일이 'NotebookLM 준비물'의 단일 출발점. 새 노트가 생기면 여기에 경로만 추가._
