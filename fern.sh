#!/usr/bin/env sh

set -e

npx --yes @fernapi/fern@1.1.12 generate packages/api/src packages/api/generated/ir.json
npx --yes fern-typescript model packages/api/generated/ir.json packages/api/generated/typescript