#!/bin/bash
set -euo pipefail

# Wire test-definition fixtures to use their openapi.yml via api.specs in
# generators.yml. Only touches fixtures that currently use a Fern definition
# as input (no api: block). Skips fixtures already wired to any spec type
# (openapi, proto, asyncapi, etc.).
#
# Prereq: run copy-openapi-specs.sh first to ensure openapi.yml exists.
#
# Usage:
#   scripts/wire-openapi-specs.sh                  # all eligible fixtures
#   scripts/wire-openapi-specs.sh imdb exhaustive   # specific fixtures

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEST_DEFS="$REPO_ROOT/test-definitions/fern/apis"

wired=0
skipped_already_wired=0
skipped_no_spec=0

if [ $# -gt 0 ]; then
    fixtures=("$@")
else
    fixtures=()
    for dir in "$TEST_DEFS"/*/; do
        fixtures+=("$(basename "$dir")")
    done
fi

for api_name in "${fixtures[@]}"; do
    dir="$TEST_DEFS/$api_name"
    gen_file="$dir/generators.yml"

    if [ ! -d "$dir" ]; then
        echo "✗ $api_name (no test definition directory)"
        continue
    fi

    # Skip fixtures that already have an api: block (already wired to some spec)
    if grep -q '^api:' "$gen_file" 2>/dev/null; then
        skipped_already_wired=$((skipped_already_wired + 1))
        continue
    fi

    # Must have an openapi.yml to wire
    if [ ! -f "$dir/openapi.yml" ]; then
        echo "✗ $api_name (no openapi.yml — run copy-openapi-specs.sh first)"
        skipped_no_spec=$((skipped_no_spec + 1))
        continue
    fi

    if [ -f "$dir/openapi-overrides.yml" ]; then
        api_block="api:\n  specs:\n    - openapi: ./openapi.yml\n      overrides: ./openapi-overrides.yml"
    else
        api_block="api:\n  specs:\n    - openapi: ./openapi.yml"
    fi

    if [ ! -f "$gen_file" ]; then
        printf '# yaml-language-server: $schema=https://schema.buildwithfern.dev/generators-yml.json\n%b\n' "$api_block" > "$gen_file"
    else
        tmp="${TMPDIR:-/tmp}/wire-openapi-specs-$$"
        first_line=$(head -1 "$gen_file")
        if echo "$first_line" | grep -q "^# yaml-language-server"; then
            echo "$first_line" > "$tmp"
            printf '%b\n' "$api_block" >> "$tmp"
            tail -n +2 "$gen_file" | grep -v "^{}$" >> "$tmp" || true
        else
            printf '%b\n' "$api_block" > "$tmp"
            grep -v "^{}$" "$gen_file" >> "$tmp" || true
        fi
        mv "$tmp" "$gen_file"
    fi

    echo "✓ $api_name"
    wired=$((wired + 1))
done

echo ""
echo "================================"
echo "Wire OpenAPI Specs Results"
echo "================================"
echo "Wired:              $wired"
echo "Already wired:      $skipped_already_wired (have api: block)"
echo "No openapi.yml:     $skipped_no_spec"
echo "================================"
