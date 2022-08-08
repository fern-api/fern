#!/usr/bin/env sh

set -e

test_dir="$(mktemp -d)"
cd "$test_dir"

echo "Running Fern Commands!"
set -x
fern init --organization fern
fern add java
fern add typescript
fern add postman
fern add openapi
fern generate
set +x

rm -rf "$test_dir"
