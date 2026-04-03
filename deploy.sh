#!/bin/bash

set -euo pipefail

echo "Validating Orbit production repo..."

if [ ! -f ".env" ]; then
  echo "Missing .env. Run: cp .env.example .env"
  exit 1
fi

required_vars=("DATABASE_URL" "JWT_SECRET" "WORKER_TOKEN" "MCP_SHARED_SECRET" "NEXT_PUBLIC_API_URL" "API_INTERNAL_URL")

for key in "${required_vars[@]}"; do
  if ! grep -q "^${key}=" .env; then
    echo "Missing ${key} in .env"
    exit 1
  fi
done

echo
echo "Repo shape is ready."
echo "Recommended free-friendly deployment split:"
echo "1. Deploy web on Vercel Hobby"
echo "2. Deploy API and worker on Render or Railway"
echo "3. Deploy Postgres on Neon or Railway Postgres"
echo "4. Set the same env secrets across API and worker"
