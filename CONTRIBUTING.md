# CONTRIBUTING — 소스 수정 시 고려사항 (GitHub Actions 빌드)

> 이 저장소는 `study/`의 마크다운을 **Next.js(정적 내보내기) + Meta Astryx 디자인 시스템**으로 빌드해 **GitHub Actions**로 **GitHub Pages**에 자동 배포한다.
> `main`에 push하면 자동 빌드·배포되므로, **아래를 지키지 않으면 화면이 깨지거나 사이트가 갱신되지 않는다.**
> 관련: [study/CONVENTIONS.md](study/CONVENTIONS.md) (형식·작성 표준)

---

## 1. 빌드/배포 파이프라인 (자동)

```
main에 push
  → GitHub Actions (.github/workflows/deploy.yml)
      1) npm install            (next, react, @astryxdesign/core, theme-neutral, katex, mermaid)
      2) npm run docs:build     (= study 정적 파일 복사 + next build site)
      3) upload-pages-artifact  (site/out)
  → deploy-pages → https://mgj96.github.io/study-repo/
```
- 상태 확인: 저장소 **Actions 탭** — https://github.com/mgj96/study-repo/actions. 빌드 실패 시 사이트는 **이전 버전 유지**.
- 최초 1회만 수동 설정 완료됨: **Settings → Pages → Source = GitHub Actions** (다시 만질 필요 없음).

### 어디에 무엇이 있나
| 위치 | 역할 |
|---|---|
| `study/**/*.md` | 노트 본문 (사이트 페이지가 됨, 파일 경로 = 주소) |
| `study/index.md` | 홈 화면 (앞부분 `hero`·`features`가 상단 카드) |
| `study/public/` | 그대로 복사되는 정적 파일 (labs 실험 페이지) |
| `site/sidebar.mjs` | 왼쪽 메뉴 |
| `site/` 나머지 | 사이트 코드 (Astryx 컴포넌트) |

---

## 2. ⚠️ 화면을 깨뜨리는 것들 (회피)

본문은 Meta Astryx의 Markdown 컴포넌트가 그린다. 이 컴포넌트는 **HTML 태그를 그리지 않는다.**

### (1) HTML 태그
- 본문에 HTML을 쓰지 않는다. **예외는 접기 하나**: `<details><summary>제목</summary> … </details>` 는 빌드 때 Astryx 접기 블록으로 바뀐다.
- 제네릭·부등호는 항상 백틱: `` `List<Integer>` ``, `` `O(1) < O(n)` ``.

### (2) 수식 `$`
- 수식은 인라인 `$...$`, 블록 `$$...$$` (LaTeX, KaTeX 렌더).
- **단독 `$`**(가격 `$5` 등)는 수식으로 오인되니 `\$5`로 이스케이프.

### (3) 도식
- ` ```mermaid ` 코드블록은 브라우저에서 그림으로 그려진다(다크모드 자동 대응). 문법이 틀리면 원문 코드가 그대로 보인다.

### (4) 새 문서 추가 시 메뉴
- 새 `.md`는 **자동으로 페이지·검색에 들어간다.** 왼쪽 메뉴에도 넣고 싶을 때만 `site/sidebar.mjs`에 한 줄 추가한다(세부 심화는 넣지 않는다 — CONVENTIONS 1.7).

### (5) 링크
- 상대 링크(`../cs/x.md`, `폴더/`)는 빌드 때 사이트 주소로 바뀐다. 폴더 링크는 그 폴더의 `README.md` → `index.md` → `concept.md` 순서로 연결된다.
- `study/` 밖(`../HANDOVER.md` 등)을 가리키면 GitHub 원문 링크로 바뀐다.
- 파일을 옮기면(`git mv`) 참조하는 상대경로도 함께 수정.

---

## 3. 편집 전/후 체크리스트

- [ ] 본문에 HTML 태그 없나? (`<details>` 접기 제외) 제네릭·부등호는 백틱
- [ ] 수식은 `$`/`$$`로, 단독 `$`는 `\$`
- [ ] 메뉴에 넣을 문서면 `site/sidebar.mjs`에 추가
- [ ] 파일 이동 시 상대경로 링크 갱신
- [ ] Q&A는 3단(① 결론 · ② 원리 · ③ 확장) 유지 ([CONVENTIONS](study/CONVENTIONS.md))

## 4. 로컬 미리보기 (선택, Node 20+ 필요)

```
npm install
npm run docs:dev      # 로컬 서버로 미리보기 (http://localhost:3000/study-repo)
npm run docs:build    # push 전에 빌드가 통과하는지 확인 (권장)
```
- `docs:build`가 로컬에서 통과하면 CI에서도 통과할 가능성이 높다. **사이트 코드(`site/`)를 고친 뒤엔 push 전에 로컬 빌드 권장.**

## 5. 실제로 겪은 실패 사례 (참고)

| 증상 | 원인 | 해결 |
|------|------|------|
| 404 · configure-pages 실패 | Pages 미활성 | Settings→Pages→Source=GitHub Actions (완료됨) |
| "Resource not accessible" | 토큰이 Pages 자동생성 불가 | 수동 활성화로 대체 (완료됨) |
| build exit code 1 (VitePress 시절) | `<Integer>`·`O(1)<...` 를 태그로 오해 | 백틱 처리 (지금도 습관으로 유지) |

## 6. 배포처 변경(선택)
- 저장소 이름이 바뀌거나 루트 도메인으로 옮기면 `site/next.config.mjs`의 `BASE_PATH`를 바꾼다(루트면 `''`).

_요약: **HTML 대신 마크다운(접기만 예외), 수식은 `$$`, 메뉴는 `site/sidebar.mjs`.**_
