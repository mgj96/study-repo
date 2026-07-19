# labs — 인터랙티브 실험 도메인 (bounded context)

공부 노트(`study/` 마크다운)와 **분리된 "실험/테스트" 도메인**입니다.
정적 HTML/JS로 자체 완결되며, 노트에 코드 의존이 없습니다(링크만).

## 현재
- 위치: `study/public/labs/` — VitePress가 그대로 서빙.
- URL: `https://mgj96.github.io/study-repo/labs/` (인덱스) · `.../labs/cs-playground.html`
- 파일:
  - `index.html` — 실험 목록(도메인 진입점)
  - `cs-playground.html` — CS 실험실(부동소수·Big-O·해시·경쟁상태)

## 경계 규칙 (분리를 쉽게 유지)
1. **자체 완결**: 각 실험은 외부 리소스 없이 단일 HTML(inline CSS/JS).
2. **노트 → 실험**은 절대 URL 링크로만. **실험 → 노트**도 절대 URL로만.
3. 공유 빌드/상태 없음. VitePress 빌드에 의존하지 않음.

## 나중에 별도 레포로 분리하려면
1. 이 `labs/` 폴더를 새 레포(예: `study-labs`)로 이동
   (`git subtree split` 또는 `git filter-repo`로 히스토리 보존 가능).
2. 새 레포에 GitHub Pages 켜기 → `mgj96.github.io/study-labs/`.
3. 노트 안 실험 링크를 새 도메인으로 교체.
4. `study/public/labs/` 제거.

→ **분리 트리거**: 실험이 정적 HTML을 넘어 앱(React·상태·API)이 되거나,
독립 빌드/배포/버전이 필요해질 때. 그전까지는 이 상태(모노레포·한 도메인 폴더)가 정답.
