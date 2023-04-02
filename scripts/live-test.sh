#!/usr/bin/env sh

set -e

cli_path="$1"
token="$2"

test_dir="$(mktemp -d)"
cd "$test_dir"

export FERN_TOKEN="$token"

echo "Running Fern Commands!"
set -x
node "$cli_path" init --organization fern
node "$cli_path" add fern-java-sdk
node "$cli_path" add fern-python-sdk
node "$cli_path" add fern-postman
node "$cli_path" generate --log-level debug
set +x
node "$cli_path" register --log-level debug

rm -rf "$test_dir"
