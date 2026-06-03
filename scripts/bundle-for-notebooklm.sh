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
CATEGORIES=(llm concepts papers cs-fundamentals conventions github-actions obsidian)

echo "== NotebookLM 번들 생성 =="
for cat in "${CATEGORIES[@]}"; do
  [ -d "$cat" ] || continue
  dest="$OUT/$cat.md"

  {
    echo "# [$cat] study-repo 번들"
    echo
    echo "> NotebookLM 소스용 자동 생성 파일. 원본은 study-repo/$cat/ 의 개별 .md."
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
