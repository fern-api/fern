#!/usr/bin/env sh

set -e

npx --yes fern@0.0.1 generate packages/api/src packages/api/generated/ir.json
npx --yes fern-typescript model packages/api/generated/ir.json packages/api/generated/typescript