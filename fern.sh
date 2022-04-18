#!/usr/bin/env sh

set -e

npx --yes fern-api@0.0.2 generate packages/api/src packages/api/generated/ir.json
npx --yes fern-typescript model packages/api/generated/ir.json packages/api/generated/typescript