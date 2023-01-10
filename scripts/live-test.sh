#!/usr/bin/env sh

set -e

cli_path="$1"
token="$2"

test_dir="$(mktemp -d)"
cd "$test_dir"

echo "Logging in"
echo "$token" | node "$cli_path" login --token-stdin --log-level debug

echo "Running Fern Commands!"
set -x
node "$cli_path" init --organization fern
node "$cli_path" add fern-java-sdk
node "$cli_path" add fern-typescript-sdk
node "$cli_path" add fern-postman
node "$cli_path" add fern-openapi
node "$cli_path" generate --group external --log-level debug
set +x
node "$cli_path" register --log-level debug --token "$token" --log-level debug

rm -rf "$test_dir"
