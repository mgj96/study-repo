# CONTRIBUTING — 소스 수정 시 고려사항 (GitHub Actions 빌드)

> 이 저장소는 `study/`의 마크다운을 **VitePress**로 빌드해 **GitHub Actions**로 **GitHub Pages**에 자동 배포한다.
> `main`에 push하면 자동 빌드·배포되므로, **아래를 지키지 않으면 빌드가 깨지고 사이트가 갱신되지 않는다.**
> 관련: [study/CONVENTIONS.md](study/CONVENTIONS.md) (형식·작성 표준)

---

## 1. 빌드/배포 파이프라인 (자동)

```
main에 push
  → GitHub Actions (.github/workflows/deploy.yml)
      1) npm install            (vitepress, markdown-it-mathjax3)
      2) npm run docs:build     (= vitepress build study)
      3) upload-pages-artifact  (study/.vitepress/dist)
  → deploy-pages → https://mgj96.github.io/study-repo/
```
- 상태 확인: 저장소 **Actions 탭**. 빌드 실패 시 사이트는 **이전 버전 유지**.
- 최초 1회만 수동 설정 완료됨: **Settings → Pages → Source = GitHub Actions** (다시 만질 필요 없음).

---

## 2. ⚠️ 빌드를 깨뜨리는 것들 (반드시 회피)

VitePress는 마크다운을 **Vue 컴포넌트로 컴파일**한다. 그래서 일반 마크다운엔 없는 함정이 있다.

### (1) 꺾쇠 `<` — 가장 흔한 원인
- 코드블록/백틱 **밖**의 `<문자` 는 Vue가 **HTML 태그로 오해** → 빌드 실패.
- ❌ `컬렉션(List<Integer>)`, `O(1)<O(n)`
- ✅ `` 컬렉션(`List<Integer>`) ``, `` `O(1) < O(n)` ``
- **규칙: 제네릭·부등호는 항상 백틱(코드)으로.**

### (2) 수식 `$`
- 수식은 인라인 `$...$`, 블록 `$$...$$` (LaTeX, MathJax 렌더).
  - 예: `$\text{Attention}(Q,K,V)=\text{softmax}(QK^\top/\sqrt{d_k})V$`
- **단독 `$`**(가격 `$5` 등)는 수식 시작으로 오인될 수 있으니 `\$5`로 이스케이프.

### (3) 중괄호 `{{ }}`
- Vue 보간(interpolation)으로 해석됨 → 오류 가능. 백틱으로 감싸거나 피하기.

### (4) 새 문서 추가 시 사이드바
- 새 `.md`를 만들면 **`study/.vitepress/config.mjs`의 `sidebar`에 링크 한 줄** 추가해야 메뉴에 나온다.

### (5) 깨진 링크
- 현재 `ignoreDeadLinks: true`라 빌드는 안 깨지지만, 링크는 되도록 유효하게 유지.
- 파일을 옮기면(`git mv`) 참조하는 상대경로(`../`, `[x](x.md)`)도 함께 수정.

---

## 3. 편집 전/후 체크리스트

- [ ] 코드블록 밖에 `<문자`(제네릭·부등호) 없나? → 백틱 처리
- [ ] 수식은 `$`/`$$`로, 단독 `$`는 `\$`
- [ ] 새 문서면 `config.mjs` sidebar에 추가
- [ ] 파일 이동 시 상대경로 링크 갱신
- [ ] Q&A는 3단(① 결론 · ② 원리 · ③ 확장) 유지 ([CONVENTIONS](study/CONVENTIONS.md))

## 4. 로컬 미리보기 (선택, Node 필요)

```
npm install
npm run docs:dev      # 로컬 서버로 미리보기
npm run docs:build    # push 전에 빌드가 통과하는지 확인 (권장)
```
- `docs:build`가 로컬에서 통과하면 CI에서도 통과할 가능성이 높다. **큰 수정 후엔 push 전에 로컬 빌드 권장.**

## 5. 실제로 겪은 실패 사례 (참고)

| 증상 | 원인 | 해결 |
|------|------|------|
| 404 · configure-pages 실패 | Pages 미활성 | Settings→Pages→Source=GitHub Actions (완료됨) |
| "Resource not accessible" | 토큰이 Pages 자동생성 불가 | 수동 활성화로 대체 (완료됨) |
| build exit code 1 | `<Integer>`·`O(1)<...` 를 태그로 오해 | 백틱 처리 |

## 6. 배포처 변경(선택)
- **Vercel**로 옮기려면 `study/.vitepress/config.mjs`의 `base: '/study-repo/'` → `base: '/'` 로 바꾸고 Vercel에서 저장소 Import.

_요약: **`<`는 백틱, 수식은 `$$`, 새 문서는 sidebar 등록.** 이 세 가지만 지키면 빌드는 안전하다._
