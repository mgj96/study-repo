# study — 학습 노트 모음

개념 학습 + 면접·암기용 노트. **표준 형식은 [CONVENTIONS.md](CONVENTIONS.md)** 참고 (주제마다 `concept.md` + `qna.md` 한 쌍).

> ✍️ 작성 원칙: **쉽게(12살 눈높이) · 얕게 시작해 물어보며 딥다이브 · Q&A는 3단(결론·원리·확장)**
> 📚 NotebookLM에 넣을 문서·링크는 [notebooklm-sources.md](notebooklm-sources.md) 한 곳에.
> ⚙️ **소스 수정 전 필독** — GitHub Actions 빌드가 안 깨지게: [../CONTRIBUTING.md](../CONTRIBUTING.md) (`<`는 백틱, 수식은 `$$`, 새 문서는 sidebar 등록)

## 목차

### 🗺️ 상위 · 계획
- [roadmap.md](roadmap.md) — 개념 중심 학습 로드맵
- [engineering-concepts-map.md](engineering-concepts-map.md) — 6렌즈 개념 지도 (Java→ML→그래픽스)
- [graphics-vs-ml.md](graphics-vs-ml.md) — 그래픽스 ↔ ML 비교와 융합
- [CONVENTIONS.md](CONVENTIONS.md) — 폴더·형식 표준 & 재편 계획

### 🧠 ai-ml/ — 인공지능 · 머신러닝
- [concept.md](ai-ml/concept.md) — ML → 신경망 → 어텐션 → 트랜스포머
- [qna.md](ai-ml/qna.md) — 암기 Q&A (얕게) · [research-log.md](ai-ml/research-log.md)

### 🎨 graphics/ — 컴퓨터 그래픽스
- [concept.md](graphics/concept.md) — 렌더링 → 파이프라인 → 레이트레이싱
- [qna.md](graphics/qna.md) — 암기 Q&A (얕게) · [research-log.md](graphics/research-log.md)

### 🧮 cs/ — CS 핵심
- [concept.md](cs/concept.md) — Big-O · 자료구조 선택 · 추상화 강점과 약점
- [qna/](cs/qna/) — **CS 암기 Q&A 40문항** (OS·네트워크·DB·자료구조) · 📄 [cs-qna.html](cs/qna/cs-qna.html)

### 💬 lang/ — 언어를 개념으로
- **java/** — [concept.md](lang/java/concept.md) (OOP·어원·철학) · [types-boxing.md](lang/java/types-boxing.md) · [qna.md](lang/java/qna.md)
- **csharp/** — [concept.md](lang/csharp/concept.md) (Java의 사촌) · [qna.md](lang/csharp/qna.md)

### 🎮 unity/ — 유니티
- [concept.md](unity/concept.md) — Unity GC (힙 반환·Incremental·할당 줄이기)
- [qna.md](unity/qna.md) — 암기 Q&A (얕게)

### 🎯 interview/ — 면접
- [explain-your-code.md](interview/explain-your-code.md) — WHAT·HOW·TRADE-OFF 코드 설명

---

## 진행 상태 (재편)
- ✅ **Phase 1** 폴더·형식 재편 (concept/qna 구조, 링크 정리)
- ✅ **Phase 2** 기존 주제 qna.md (ai-ml·graphics·java) — 얕게 5문항씩
- ✅ **Phase 3** 신규 C#·Unity concept+qna — 얕게
- ⬜ **Phase 4** HTML(선택), 각 주제 심화

_모든 qna는 "얕게 시작" 상태. 각 파일 끝의 "더 깊이" 항목을 물어보면 딥다이브._
