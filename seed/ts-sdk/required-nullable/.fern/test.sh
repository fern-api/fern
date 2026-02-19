#!/bin/sh
set -e

if [ ! -f "package.json" ]; then
  echo "No package.json found, skipping tests"
  exit 0
fi

if grep -q '"test":' package.json; then
  corepack pnpm test
fi
