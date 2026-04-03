#!/bin/bash

# ===== CONFIG =====
REPO_NAME="hybrid-browser-agent"
VISIBILITY="public" # change to private if needed

# ===== CHECKS =====
echo "🔍 Checking requirements..."

command -v git >/dev/null 2>&1 || { echo "❌ Git not installed"; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "❌ GitHub CLI (gh) not installed. Install: https://cli.github.com/"; exit 1; }

# ===== LOGIN CHECK =====
echo "🔐 Checking GitHub auth..."
gh auth status || gh auth login

# ===== INIT REPO =====
echo "📦 Initializing repo..."
git init
git add .
git commit -m "Initial commit - hybrid browser agent"

# ===== CREATE GITHUB REPO =====
echo "🌐 Creating GitHub repo..."
gh repo create "$REPO_NAME" --$VISIBILITY --source=. --remote=origin --push

# ===== SET MAIN BRANCH =====
git branch -M main
git push -u origin main

echo "✅ Done!"
echo "👉 Repo: https://github.com/$(gh api user --jq .login)/$REPO_NAME"