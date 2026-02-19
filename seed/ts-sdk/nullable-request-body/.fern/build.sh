#!/bin/sh
set -e

corepack enable
corepack prepare pnpm --activate
corepack pnpm install --frozen-lockfile
corepack pnpm build
