#!/usr/bin/env bash

set -e

/bin/rm -r generated
mkdir generated

npx --ignore-existing @fernapi/fern generate src generated/ir.json
npx --ignore-existing @fernapi/fern-typescript model generated/ir.json generated/typescript
