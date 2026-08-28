#!/bin/bash
set -euo pipefail

OWNER="keianduu"
REPO="$(basename -s .git "$(git remote get-url origin)")"
REMOTE="https://github.com/${OWNER}/${REPO}.git"
PAGES_URL="https://${OWNER}.github.io/${REPO}/prototype/"

echo "== Muuzee GitHub publish =="

if ! command -v git >/dev/null 2>&1; then
  echo "git が見つかりません。"
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) が必要です。"
  echo "Homebrew: brew install gh"
  echo "その後: gh auth login"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI にログインしてください:"
  echo "gh auth login"
  exit 1
fi

# Run this script from the art project root.
if [ ! -f "AGENTS.md" ] || [ ! -d "prototype" ]; then
  echo "art プロジェクトのルートで実行してください。"
  echo "AGENTS.md と prototype/ が必要です。"
  exit 1
fi

if [ ! -d ".git" ]; then
  git init
fi

git branch -M main

if ! gh repo view "${OWNER}/${REPO}" >/dev/null 2>&1; then
  echo "GitHub repo ${OWNER}/${REPO} を作成します..."
  gh repo create "${OWNER}/${REPO}" \
    --public \
    --description "Muuzee — art discovery and personal archive prototype"
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "${REMOTE}"
else
  git remote add origin "${REMOTE}"
fi

git add .

if ! git diff --cached --quiet; then
  git commit -m "prototype: initialize Muuzee UI workspace"
else
  echo "Commit対象の変更はありません。"
fi

git push -u origin main

echo "GitHub Pages を有効化します..."
if gh api "repos/${OWNER}/${REPO}/pages" >/dev/null 2>&1; then
  echo "Pages は既に有効です。"
else
  printf '{"source":{"branch":"main","path":"/"}}' | \
    gh api --method POST "repos/${OWNER}/${REPO}/pages" --input - >/dev/null
fi

echo ""
echo "公開URL:"
echo "${PAGES_URL}"
echo ""
echo "反映には通常数十秒〜数分かかります。"

if command -v curl >/dev/null 2>&1; then
  echo "公開待ち..."
  for i in $(seq 1 24); do
    if curl -fsS -o /dev/null "${PAGES_URL}"; then
      echo "公開を確認しました:"
      echo "${PAGES_URL}"
      exit 0
    fi
    sleep 5
  done
  echo "まだ公開確認できませんでした。少し待ってURLを開いてください。"
fi
