#!/usr/bin/env sh

set -e

npx --yes @fernapi/fern@0.1.6 generate packages/api/src packages/api/generated/ir.json
npx --yes @fernapi/fern-typescript model packages/api/generated/ir.json packages/api/generated/typescript