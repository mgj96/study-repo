# study 폴더 표준 형식 & 재편 계획

> 목적: 뒤섞인 형식을 통일한다. **주제마다 "개념 노트 + Q&A(3단)" 한 쌍**을 기본으로.

---

## 1. 표준 형식 (모든 주제 공통)

주제 = **폴더 하나**. 그 안에 아래 파일을 둔다.

| 파일 | 역할 | 필수 |
|------|------|------|
| `concept.md` | 학습용 개념 노트 (서술형) | ✅ |
| `qna.md` | 3단 암기·면접 Q&A | ✅ |
| `qna.html` | 보기 좋은 아코디언(선택) | ⬜ |
| `research-log.md` | 검색·출처 기록 | ⬜ |

### `concept.md` 뼈대
```
# <주제> — 개념 노트
> 용도 / 관련 링크
## 0. 큰 그림 (한 문단)
## 1..N 단원  — 각 단원 끝에 **핵심 요약** + `참조` 링크
## 용어 사전 (한↔영)
## 참조 출처
```

### `qna.md` 뼈대 (3단 고정)
```
# <주제> — 암기 Q&A
### Q1. 질문?
- **① 결론 · WHAT** 한 문장 답
- **② 원리 · HOW** 왜 그런가
- **③ 확장 · TRADE-OFF** 실무 함의·대안·연결
```
> 3단 라벨은 항상 `① 결론·WHAT / ② 원리·HOW / ③ 확장·TRADE-OFF`.

---

## 1.5 작성 원칙 (내용 스타일) ⭐

1. **쉽게 쓴다 (12살 눈높이)** — 어려운 용어는 비유·한 줄 뜻풀이와 함께. 먼저 "쉬운 그림" → 그다음 정확한 용어.
2. **얕게 시작, 점진적 딥다이브** — 한 번에 다 쓰지 않는다. 각 주제는 **핵심만 약간** 먼저 → 사용자가 물어보면 그 부분을 더 깊이 파고든다. (심화는 "더 볼까요?" 식으로 이어가기)
3. **Q&A 3단 고정** — `① 결론·WHAT / ② 원리·HOW / ③ 확장·TRADE-OFF`.
4. **상호 링크** — 관련 개념(예: 박싱↔GC, 값/참조 타입)은 서로 연결.

> 즉, 문서는 "두껍게 다 채운 교과서"가 아니라 **"쉬운 뼈대 + 점점 깊어지는 층"**. 깊이는 대화로 쌓는다.

### 중요도 기반 깊이 + 도식/NotebookLM 규칙 ⭐
- **중요도 판단**: 처음 보는 사용자에게 **핵심 개념**은 장면·비유·도식으로 **상세히**, **부수적·단순 개념**은 짧게. (모두를 똑같이 길게 쓰지 않는다)
- **개념 단위로**: 입문자가 계단 밟듯 한 개념씩.
- **같은 md 하나로 사이트 + NotebookLM 둘 다 커버**. 상세 서술은 양쪽 다 이득.
- **도식엔 반드시 텍스트 설명 동반**: Mermaid는 NotebookLM에서 그림이 안 보이므로, 도식 바로 아래(또는 위)에 그 내용을 **한두 문장 글로** 풀어 적는다. (그림 없이도 뜻이 통하게 = 접근성 + NotebookLM 캡처)

### 심화(딥다이브) 정리 원칙 ⭐
딥다이브를 요청받으면 얕은 뼈대와 달리 **깊고 길게, 근거를 붙여** 정리한다.
- **웹검색 + 논문**에서 찾아 **핵심을 발췌·인용**하고 출처(저자·연도·URL/arXiv)를 단다.
- **길이 제한 없음** — 몇십 장이 넘어가도 된다. 대신 12살 눈높이 요약 → 정확한 심화 순서를 지킨다.
- 저작권: 원문 긴 인용은 피하고 짧은 발췌 + 내 말로 재정리 + 출처 링크.
- 심화 결과물은 해당 주제 폴더에 `deep-<소주제>.md`로 저장하고 concept/qna에서 링크.

## 1.6 VitePress 빌드 안전 규칙 ⚠️

사이트가 VitePress(Vue)로 빌드되므로, 마크다운 본문에서 다음을 지킨다:
- **꺾쇠(`<`)는 항상 백틱/코드로**: 제네릭·부등호는 `` `List<Integer>` ``, `` `O(1) < O(n)` `` 처럼. 코드블록 밖의 `<문자`는 Vue가 HTML 태그로 오해해 **빌드가 깨진다.**
- **수식은 `$...$`(인라인) / `$$...$$`(블록) LaTeX** 사용 (KaTeX/MathJax 렌더). 예: `$\text{Attention}(Q,K,V)=\text{softmax}(QK^\top/\sqrt{d_k})V$`.
- **가격 등 단독 `$`** 는 `\$`로 이스케이프(수식으로 오인 방지).
- ASCII 다이어그램·의사코드는 그대로 ```코드블록``` 유지.

## 2. 목표 폴더 구조

```
study/
├─ README.md                 (마스터 인덱스)
├─ CONVENTIONS.md            (이 문서)
├─ roadmap.md                ┐
├─ engineering-concepts-map.md│ 상위·교차 개념 (그대로 유지)
├─ graphics-vs-ml.md         ┘
├─ ai-ml/        concept.md · qna.md(신규) · research-log.md
├─ graphics/     concept.md · qna.md(신규) · research-log.md
├─ cs/           concept.md · qna/(40문항 유지) · qna.html
├─ lang/
│  ├─ java/      concept.md · qna.md(신규)
│  └─ csharp/    concept.md(신규) · qna.md(신규)
├─ unity/        concept.md(신규) · qna.md(신규) · qna.html
└─ interview/    explain-your-code.md (그대로)
```

---

## 3. 파일 이동/생성 매핑

| 현재 | → 목표 | 작업 |
|------|--------|------|
| `ai-ml/ml-attention-study-note.md` | `ai-ml/concept.md` | 이름변경 |
| — | `ai-ml/qna.md` | **신규** |
| `graphics/graphics-study-note.md` | `graphics/concept.md` | 이름변경 |
| — | `graphics/qna.md` | **신규** |
| `cs/algorithms-and-abstraction.md` | `cs/concept.md` | 이름변경 |
| `cs/qna/*` | `cs/qna/*` | 유지 |
| `lang/java-oop.md` + `lang/types-and-boxing.md` | `lang/java/concept.md` | 합쳐 이동 |
| — | `lang/java/qna.md` | **신규** |
| — | `lang/csharp/concept.md` + `qna.md` | **신규** (값/참조·박싱·LINQ·async) |
| `cs/unity-garbage-collection.md` | `unity/concept.md` | 이동 (GC + 생명주기·컴포넌트 확장) |
| — | `unity/qna.md` | **신규** |

> C# ↔ Java ↔ Unity는 서로 링크(박싱=GC, 값/참조 타입 등 공통 개념 연결).

---

## 4. 실행 단계 (Phase)

- **Phase 1 — 재편**: 폴더 만들고 기존 파일 이동/이름변경(`git mv`), README·링크 갱신.
- **Phase 2 — 기존 주제 Q&A 채우기**: ai-ml·graphics·java qna.md 신규 작성(각 8~10문항, 3단).
- **Phase 3 — 신규 주제**: C#·Unity의 concept + qna 작성.
- **Phase 4 — HTML**: 필요한 주제에 아코디언 HTML(선택).
- 각 Phase 끝에 커밋.

---

## 5. 형식 규칙 요약 (체크리스트)
- [ ] 주제 폴더에 `concept.md`와 `qna.md`가 둘 다 있는가
- [ ] Q&A는 3단(결론·원리·확장) 라벨을 지켰는가
- [ ] 개념 노트는 단원마다 핵심 요약 + 참조가 있는가
- [ ] README 인덱스에 링크했는가
- [ ] 관련 주제끼리 상호 링크했는가

_작성: 2026-07 · 확정 후 Phase 1부터 실행._
