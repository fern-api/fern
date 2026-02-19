#!/bin/sh
set -e

if [ ! -f "package.json" ]; then
  echo "No package.json found, skipping build"
  exit 0
fi

corepack enable
corepack prepare yarn --activate

if [ -f "yarn.lock" ]; then
  corepack yarn install --frozen-lockfile
else
  corepack yarn install
fi

if grep -q '"build":' package.json; then
  corepack yarn build
fi
