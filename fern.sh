#!/usr/bin/env sh

set -e

/bin/rm -rf packages/api/generated
mkdir packages/api/generated

npx --yes @fernapi/fern generate packages/api/src packages/api/generated/ir.json
npx --yes @fernapi/fern-typescript model packages/api/generated/ir.json packages/api/generated/typescript