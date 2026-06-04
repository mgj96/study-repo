#!/usr/bin/env bash
# study-repo의 .md 문서를 NotebookLM 업로드용으로 묶는 스크립트.
#
# 분리 단위 = 카테고리(폴더). 카테고리 1개 → 번들 .md 1개 → NotebookLM 소스 1개.
#   - NotebookLM 제한: 소스 50개 / 소스당 50만 단어
#   - 카테고리로 묶으면 관련 지식이 한 소스에 모이고, 문서 추가 시 번들만 커진다(확장성).
#
# 사용법:  bash scripts/bundle-for-notebooklm.sh
# 결과:    dist/notebooklm/<카테고리>.md  (이 폴더째 NotebookLM에 업로드)

set -euo pipefail

# 레포 루트로 이동 (스크립트 위치 기준)
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OUT="dist/notebooklm"
rm -rf "$OUT"
mkdir -p "$OUT"

# 묶을 카테고리 폴더들 (여기 한 줄 추가하면 새 카테고리도 자동 포함 → 확장 지점)
CATEGORIES=(algorithms llm concepts papers cs-fundamentals conventions tradeoffs thinking quizzes github-actions obsidian)

# 카테고리별 한 줄 소개 — NotebookLM 소스 첫머리에 들어가 '이게 뭔지'를 알려준다.
# (bash 3.2 호환 위해 associative array 대신 case 사용)
desc() {
  case "$1" in
    algorithms)     echo "알고리즘 정석 — Big-O부터 단계별. 각 문서에 직접 풀 문제 포함." ;;
    llm)            echo "LLM이 어떻게 동작하는지(토큰·attention·환각)와 도구별 비교·활용법." ;;
    concepts)       echo "LLM 핵심 개념 심화 — 정렬(RLHF/RLAIF)과 MoE 구조." ;;
    papers)         echo "검증된 arXiv 논문 요약 — 환각의 불가피성·창의성, 추론, 창발 논쟁." ;;
    cs-fundamentals) echo "하드웨어를 의식하는 CS 기초 — 메모리 계층·확장·동시성·복잡도·네트워크." ;;
    conventions)    echo "찾기 좋은 코드(아키텍처·명명)가 곧 AI 친화적이라는 원칙." ;;
    tradeoffs)      echo "'무조건 정답'은 없다 — 통념을 깨는 실무 사례와 트레이드오프 판단법." ;;
    thinking)       echo "추론 기법(연역·귀납·가추)·first-principles와 LLM 시대 사고력 유지법." ;;
    quizzes)        echo "공부 내용을 정리+퀴즈로. NotebookLM에 넣고 '퀴즈 내줘'로 자가 테스트." ;;
    github-actions) echo "GitHub Actions 실전 — 재사용 워크플로우와 PR 자동 리뷰봇." ;;
    obsidian)       echo "마크다운 기반 지식 관리와 LLM으로 지식 유지하기." ;;
    *)              echo "study-repo 학습 노트 모음." ;;
  esac
}

echo "== NotebookLM 번들 생성 =="
for cat in "${CATEGORIES[@]}"; do
  [ -d "$cat" ] || continue
  dest="$OUT/$cat.md"

  {
    echo "# [$cat] study-repo 번들"
    echo
    echo "## 이 소스는 무엇인가"
    echo
    echo "$(desc "$cat")"
    echo
    echo "이 파일은 study-repo/$cat/ 의 여러 .md를 NotebookLM 소스 하나로 합친 것이다."
    echo "아래 각 \`<!-- source: ... -->\` 구분선부터가 개별 문서다."
    echo "공부할 때는 NotebookLM에 '이 소스를 초보자도 알게 요약해줘' 또는"
    echo "'핵심 개념을 예시와 함께 설명해줘'처럼 물어보면 된다."
    echo
  } > "$dest"

  # 카테고리 내 모든 .md를 파일명 헤더와 함께 이어붙임 (출처 추적용)
  found=0
  for f in "$cat"/*.md; do
    [ -e "$f" ] || continue
    found=1
    {
      echo
      echo "---"
      echo
      echo "<!-- source: $f -->"
      echo
      cat "$f"
      echo
    } >> "$dest"
  done

  if [ "$found" -eq 0 ]; then
    rm -f "$dest"
    continue
  fi

  words=$(wc -w < "$dest" | tr -d ' ')
  printf "  %-18s → %-32s %s 단어\n" "$cat/" "$dest" "$words"
done

echo
echo "완료. dist/notebooklm/ 폴더의 .md들을 NotebookLM에 업로드하세요."
echo "(소스당 50만 단어 제한 — 위 단어 수가 그보다 작으면 OK)"
