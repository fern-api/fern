#!/usr/bin/env sh

set -e

cli_path="$1"
token="$2"

test_dir="$(mktemp -d)"
cd "$test_dir"

echo "Running Fern Commands!"
set -x
node "$cli_path" init --organization fern
node "$cli_path" add java
node "$cli_path" add typescript
node "$cli_path" add postman
node "$cli_path" add openapi
node "$cli_path" generate --group external --log-level debug
node "$cli_path" register --log-level debug --token "$token" 
set +x

rm -rf "$test_dir"
