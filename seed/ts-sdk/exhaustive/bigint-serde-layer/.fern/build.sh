#!/bin/sh
set -e

if [ ! -f "package.json" ]; then
  echo "No package.json found, skipping build"
  exit 0
fi

corepack enable
corepack prepare pnpm --activate

if [ -f "pnpm-lock.yaml" ]; then
  corepack pnpm install --frozen-lockfile
else
  corepack pnpm install
fi

if grep -q '"build":' package.json; then
  corepack pnpm build
fi
