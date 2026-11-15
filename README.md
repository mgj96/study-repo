# study-repo — 개발 학습 노트

[![Live Site](https://img.shields.io/badge/📖_Live_Site-mgj96.github.io%2Fstudy--repo-D97757?style=for-the-badge)](https://mgj96.github.io/study-repo/)

**▶ 웹으로 보기: <https://mgj96.github.io/study-repo/>** (GitHub Pages · `main` 푸시 시 자동 배포)

AI 도구를 적극적으로 활용하는 개발자의 지식 창고.
Claude Code와 논의하며 내용을 결정하고, 합의된 결과를 사이트(Next.js + Meta Astryx 디자인 시스템)로 배포한다.

---

## 📂 구조 — 한 권의 책 `study/book/`

사이트 콘텐츠는 **"구조를 설계하고 바꾸는 엔지니어"** 한 권으로 묶여 있다. 전체 목차는 [study/README.md](study/README.md).

| 부 | 내용 |
|---|---|
| [서문](study/book/preface/00-how-to-read.md) | 이 책을 읽는 법 · 트레이드오프를 읽는 법 · 추론 기법 |
| [1부 컴퓨터가 일하는 방식](study/book/part1/) | 추상화·복잡도, 메모리, 동시성·JMM, 자료구조·인덱스 |
| [2부 데이터와 일관성](study/book/part2/) | 트랜잭션, 캐시·분산 락, 분산 정합성, 통신, 성능 |
| [3부 경계를 긋는 법](study/book/part3/) | 설계의 출발점, 모듈성, 콘웨이 법칙, 온프레미스·클라우드 |
| [4부 운영 중인 구조 바꾸기](study/book/part4/) | 전환 사례와 판단 기준, 구조를 CI로 지키기 |
| [5부 AI 시대의 검증](study/book/part5/) | 검증의 시대, 테스트와 품질 게이트 |
| [부록](study/book/appendix/) | A 언어·도구 · B 수학 · C AI·ML · D 그래픽스·Unity · E 면접·코테 |

## 🎧 Gemini · NotebookLM으로 듣기

- 각 페이지 위 **원문 링크 복사** 버튼 → 붙여넣기 (raw 마크다운 주소).
- 부 단위 합본: `https://mgj96.github.io/study-repo/bundle/part1.md` ~ `part5.md`, `appendix.md` (빌드 때 자동 생성).
- 원칙: **이 저장소(git)가 진실의 원천**, NotebookLM은 소비·학습용.

## 🛠 로컬 빌드

```bash
npm install
npm run docs:dev      # 로컬 미리보기
npm run docs:build    # 프로덕션 빌드 (site/out)
```

배포는 `.github/workflows/deploy.yml`이 `main` 푸시마다 자동 수행한다.

## 📜 운영 규칙

- 작성 규칙: [study/CONVENTIONS.md](study/CONVENTIONS.md) · [study/writing-guide.md](study/writing-guide.md)
- 작업 현황 인수인계: `HANDOVER.md` (있다면 먼저 읽기)
- 노트 형식: **① 결론(WHAT) → ② 원리(HOW) → ③ 확장(TRADE-OFF)** 3단 구조, 근거는 출처 링크로

---

> 운영 방식: Claude Code와 논의 → 합의된 내용을 노트로 저장 → 커밋·푸시 → 자동 배포 → 라이브 확인.
