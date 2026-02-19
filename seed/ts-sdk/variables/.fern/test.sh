#!/bin/sh
set -e

corepack enable
corepack prepare pnpm --activate
corepack pnpm test
