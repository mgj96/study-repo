# study-repo — 개발 학습 노트

[![Live Site](https://img.shields.io/badge/📖_Live_Site-mgj96.github.io%2Fstudy--repo-D97757?style=for-the-badge)](https://mgj96.github.io/study-repo/)

**▶ 웹으로 보기: <https://mgj96.github.io/study-repo/>** (GitHub Pages · `main` 푸시 시 자동 배포)

AI 도구를 적극적으로 활용하는 개발자의 지식 창고.
Claude Code와 논의하며 내용을 결정하고, 합의된 결과를 VitePress 사이트로 배포한다.

---

## 📂 구조 — 사이트 본체는 `study/`

VitePress로 빌드되는 콘텐츠는 전부 [`study/`](study/) 아래에 있다. 웹이 아니라 GitHub 화면에서 훑을 때는 아래 지도를 따라간다.

| 폴더/문서 | 내용 |
|---|---|
| [study/coding-test/](study/coding-test/) | **코딩테스트 유형 훈련** — 실전 기출 복기 2편 + 유형 드릴 11편 + org.json 치트시트 (Lv2~Lv3 초입). 폴더 안 README가 색인 |
| [study/coding-test-2week.md](study/coding-test-2week.md) | 코딩테스트 2주 압축 로드맵 (Java) |
| [study/interview/](study/interview/) | 면접 대비 — 코드 설명 프레임워크 등 |
| [study/backend-roadmap.md](study/backend-roadmap.md) | 백엔드 심화 로드맵 + 5~7년차 언어 전략(§6)·채용시장 조사(§6.1) |
| [study/cs/](study/cs/) | CS 딥다이브 — JMM, 메모리, 네트워크 등 |
| [study/lang/](study/lang/) | 언어 — Java 품질 게이트, Kotlin(for Java devs), IDE·에이전트 도구 전략 |
| [study/architecture/](study/architecture/) | 아키텍처·설계 원칙 |
| [study/ai-ml/](study/ai-ml/) | AI·ML 이해 |
| [study/graphics/](study/graphics/) · [study/unity/](study/unity/) | 그래픽스 · Unity/GC |
| [study/engineering-concepts-map.md](study/engineering-concepts-map.md) | 개념 연결 지도 (트레이드오프 렌즈) |
| [study/roadmap.md](study/roadmap.md) | 관심사 기반 로드맵 (ML·그래픽스) |

## 🎧 NotebookLM으로 학습하기

- **소스 등록**: [study/notebooklm-sources.md](study/notebooklm-sources.md) — 사이트 링크와 raw 링크가 카테고리별로 정리돼 있어 NotebookLM에 바로 붙여넣는다.
- 원칙: **이 저장소(git)가 진실의 원천**, NotebookLM은 소비·학습용. 새 노트를 추가하면 위 소스 문서에도 등록한다.

## 🛠 로컬 빌드

```bash
npm install
npm run docs:dev      # 로컬 미리보기
npm run docs:build    # 프로덕션 빌드 (study/.vitepress/dist)
```

배포는 `.github/workflows/deploy.yml`이 `main` 푸시마다 자동 수행한다.

## 📜 운영 규칙

- 작성 규칙: [study/CONVENTIONS.md](study/CONVENTIONS.md) · [study/writing-guide.md](study/writing-guide.md)
- 작업 현황 인수인계: `HANDOVER.md` (있다면 먼저 읽기)
- 노트 형식: **① 결론(WHAT) → ② 원리(HOW) → ③ 확장(TRADE-OFF)** 3단 구조, 근거는 출처 링크로

## 🗄 레거시 폴더

루트의 `algorithms/`, `llm/`, `concepts/`, `cs-fundamentals/`, `conventions/`, `tradeoffs/`, `github-actions/`, `obsidian/`, `papers/`, `quizzes/`, `thinking/`, `languages/`는 **VitePress 이전(사이트 미포함) 시절의 노트**다. 내용 참고는 가능하지만 최신 정리는 전부 `study/`에서 이루어진다. NotebookLM 번들 스크립트(`scripts/bundle-for-notebooklm.sh`)도 이 레거시 구조 기준의 구버전이다.

---

> 운영 방식: Claude Code와 논의 → 합의된 내용을 노트로 저장 → 커밋·푸시 → 자동 배포 → 라이브 확인.
