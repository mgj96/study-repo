# 인수인계 문서 (HANDOVER)

> 이 저장소를 이어서 작업하는 사람(사람이든 AI든)을 위한 **단일 출발점**.
> 목적: 사용자가 그동안 준 피드백·선호를 지켜서 **같은 실수를 반복하지 않게** 하는 것.
> 함께 볼 것: [study/CONVENTIONS.md](study/CONVENTIONS.md)(형식 표준) · [CONTRIBUTING.md](CONTRIBUTING.md)(빌드 규칙) · [study/notebooklm-sources.md](study/notebooklm-sources.md)

---

## 0. 이 저장소가 뭔가
- **개발 학습 노트**(CS · ML · 그래픽스 · 언어 · 면접)를 마크다운으로 정리한 저장소.
- **VitePress**로 빌드해 **GitHub Actions → GitHub Pages**에 자동 배포.
- 라이브: **https://mgj96.github.io/study-repo/**
- 소스: `github.com/mgj96/study-repo`
- 같은 md 하나가 **사이트 + NotebookLM 소스** 둘 다로 쓰인다.

---

## 1. ⭐ 사용자 선호 · 피드백 (가장 중요 — 반드시 지킬 것)

### 1-1. 콘텐츠 작성 스타일
- **쉽게 먼저(12살 눈높이) → 점점 깊게.** 어려운 용어는 비유·뜻풀이와 함께.
- **"장면 → 비유 → 도식 → 긴 서술"** 순으로 **기억에 남게** 쓴다. (뉴스처럼 스치는 요약 ❌)
  - 예: "그것이 피곤했다에서 그것은 누구?"로 궁금증을 던지고 풀어감.
- **중요도 판단**: 핵심 개념은 **상세히**(도식+긴 서술), 부수·단순 개념은 **짧게**. 모두를 똑같이 길게 쓰지 않는다.
- **개념 단위로**, 처음 보는 사용자 기준으로.
- **CS/암기성 답변은 3단 고정**: `① 결론·WHAT / ② 원리·HOW / ③ 확장·TRADE-OFF`.
- **딥다이브는 논문·검색 기반** — 발췌·인용 + 출처(저자·연도·arXiv/URL), **길이 제한 없음**(몇십 장 OK).

### 1-2. 도식(다이어그램)
- **Mermaid**로 원본 제작(외부 이미지는 저작권 이슈 → 안 씀). 코럴 테마 적용됨.
- **도식마다 바로 아래 "텍스트 설명" 한두 문장 필수** — Mermaid는 NotebookLM에서 그림이 안 보이므로 글로도 뜻이 통하게. (접근성 + NotebookLM 캡처)

### 1-3. NotebookLM
- **같은 md로 사이트+NotebookLM 둘 다 커버.** 상세 서술은 양쪽 다 이득.
- 넣을 소스 링크는 [study/notebooklm-sources.md](study/notebooklm-sources.md)에 **Raw 링크**로 모아둠(맨 아래 사이트맵).

### 1-4. 정보 구조 (사이드바 폭발 방지)
- **사이드바 = 큐레이션된 "학습 척추"만**(개념·Q&A·대표 딥다이브). 모든 페이지를 넣지 않는다.
- **세부 파생 심화는 사이드바에 안 넣고** 본문 **인라인 링크(`🔎 더 깊이 →`) + 검색**으로 도달 (Obsidian식). 예: `ai-ml/deep-representation.md`.
- 딥다이브 여러 개면 **접힌(collapsed) 하위 그룹**으로. 아주 작은 심화는 **`<details>` 접기**로.

### 1-5. 작업 방식
- **커밋/푸시는 사용자가 요청할 때.** "먼저 보여줘" 하면 파일만 만들고 내용을 채팅에 보여준 뒤 확인받는다. (단, 지금은 자동배포 흐름이라 대체로 커밋 진행 OK — 애매하면 물어볼 것)
- **큰 변경 후엔 빌드·배포를 확인**한다(아래 3장). 실패하면 로그 보고 고친다.

---

## 2. 🚫 반복하면 안 되는 실수 (이번 세션에서 실제로 겪음)
1. **마크다운 본문의 꺾쇠 `<`** — 코드/백틱 밖의 `<Integer>`, `O(1)<O(n)` 는 VitePress(Vue)가 HTML 태그로 오해해 **빌드 실패**. → 제네릭·부등호는 항상 백틱: `` `List<Integer>` ``.
2. **수식** — `$...$`/`$$...$$`(LaTeX, MathJax). 가격 등 **단독 `$`는 `\$`로 이스케이프**.
3. **GitHub Pages 최초 활성화** — 워크플로 토큰으론 못 켠다. Settings→Pages→Source=**GitHub Actions**로 사람이 1회 수동 설정(이미 완료). `enablement:true`도 권한 없어 실패했었음.
4. **새 문서 추가 시** `study/.vitepress/config.mjs` sidebar 등록(단, 세부 심화는 일부러 등록 안 함 — 1-4 참고).
5. **파일 이동(`git mv`) 시** 참조 상대경로(`../`, `[x](x.md)`)도 함께 수정.
6. **헤드리스 브라우저 검증 한계** — 프로그램적 `scrollTo`는 scroll 이벤트를 안 쏘고, `requestAnimationFrame`은 멈춤. 시간 기반 기능은 `setInterval`로, 검증은 이벤트 수동 dispatch로.

---

## 3. 빌드·배포 파이프라인 (자동)
```
main에 push → GitHub Actions(.github/workflows/deploy.yml)
  → npm install (vitepress, markdown-it-mathjax3, mermaid, vitepress-plugin-mermaid)
  → npm run docs:build (= vitepress build study)
  → Pages 배포 → https://mgj96.github.io/study-repo/
```
- 상태: 저장소 **Actions 탭**. 빌드 실패 시 사이트는 이전 버전 유지.
- 로컬 미리보기(선택, Node 필요): `npm install` → `npm run docs:dev`. 큰 수정 후 `npm run docs:build`로 사전 검증 권장.
- 검증 팁: 배포 후 페이지에서 `document.querySelectorAll('.mermaid svg').length`, `mjx-container` 개수, 문법오류 등을 확인.

---

## 4. 저장소 구조
```
study/
├─ .vitepress/config.mjs        사이트 설정(사이드바·검색 한글·mermaid 테마·base=/study-repo/)
├─ .vitepress/theme/            커스텀 테마
│   ├─ index.js, custom.css     Pretendard 폰트·Claude 코럴·모바일 표·읽기바
│   └─ Layout.vue               읽기 진행바 + 도구 FAB(자동스크롤·북마크·이어읽기)
├─ index.md                     홈(hero)
├─ CONVENTIONS.md               형식·작성·IA 표준 (1.5~1.7절이 핵심 규칙)
├─ notebooklm-sources.md        NotebookLM 소스 링크 모음
├─ roadmap.md · engineering-concepts-map.md · graphics-vs-ml.md
├─ ai-ml/     concept · qna · research-log · deep-*(attention/backprop/rnn/embedding/representation)
├─ graphics/  concept · qna · research-log · deep-rendering-math
├─ cs/        concept · qna/(os·network·database·ds-algorithm) · cs-qna.html
├─ lang/java/ concept · types-boxing · qna    lang/csharp/ concept · qna
├─ unity/     concept · qna · deep-gc
└─ interview/ explain-your-code
CONTRIBUTING.md                 빌드 규칙(편집 전 필독)
package.json / .github/workflows/deploy.yml
```

### 사이트 기능 (Layout.vue / custom.css)
- 상단 **읽기 진행바**, 우하단 **📖 도구 FAB**(탭하면 펼침): ▶자동읽기(−/+속도)·🔖북마크·📑목록(북마크·이어보기)
- **보던 스크롤 위치 자동 저장·복원**, **북마크**(localStorage, 기기별)
- 한글 검색 UI, 다크모드, KaTeX 수식, Mermaid 도식(코럴), 모바일 표 줄바꿈
- ※ **음성 낭독(TTS)은 제거됨** — 다시 넣지 말 것(사용자 요청으로 삭제).

---

## 5. 다음 할 일 (남은 TODO)
research-log의 미처리 항목:
- ML: `RLHF/파인튜닝`, `파이썬 미니 신경망 구현(코드)`
- 그래픽스: `GLSL 실습`, `섀도우 매핑`, `전역조명(GI/AO)`, `BVH`, `AI 디노이징·DLSS`
- 각 개념 노트의 나머지 단원 상세화(중요도 판단하여) — 도식엔 항상 텍스트 설명.

---

## 6. 요약 (한 줄)
> **쉽게→깊게, 장면·비유·도식(+텍스트 설명), CS는 3단, 사이드바는 척추만·나머지는 인라인 링크.** 빌드는 `<`·`$`만 조심. 커밋 후 Actions 확인.

_최종 갱신: 2026-07 · 이 문서를 최신으로 유지할 것(새 규칙·실수·기능은 여기 추가)._
