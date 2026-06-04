#!/usr/bin/env bash
# 더블클릭 한 번으로 NotebookLM 업로드용 묶음 생성.
# (맥: .command 는 더블클릭 시 터미널에서 실행됨. 첫 실행만 우클릭→열기 필요할 수 있음)

cd "$(dirname "$0")" || exit 1

echo "==============================================="
echo " NotebookLM 묶음 만들기"
echo "==============================================="

echo "[1/3] 최신 내용 받기 (git pull)..."
git pull --ff-only 2>/dev/null && echo "  최신화 완료" || echo "  (생략/실패 — 로컬 상태로 진행)"

echo "[2/3] 카테고리별 번들 생성..."
bash scripts/bundle-for-notebooklm.sh

echo "[3/3] 폴더 열기..."
open dist/notebooklm/ 2>/dev/null

echo ""
echo "끝! 열린 폴더의 .md 파일들을 https://notebooklm.google.com 에 드래그하세요."
echo "(이 창은 닫아도 됩니다)"
