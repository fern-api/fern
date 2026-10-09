#!/bin/bash
set -euo pipefail

# Copy seed-generated OpenAPI specs into test-definition directories and
# generate x-fern-sdk-group-name / x-fern-sdk-method-name overrides.
# Does NOT modify generators.yml — use wire-openapi-specs.sh for that.
#
# Usage:
#   scripts/copy-openapi-specs.sh                  # all fixtures
#   scripts/copy-openapi-specs.sh imdb exhaustive   # specific fixtures

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SEED_OPENAPI="$REPO_ROOT/seed/openapi"
TEST_DEFS="$REPO_ROOT/test-definitions/fern/apis"

copied=0
skipped=0
no_seed_spec=0

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
    if [ ! -d "$dir" ]; then
        echo "✗ $api_name (no test definition directory)"
        continue
    fi

    gen_file="$dir/generators.yml"

    # Skip fixtures already wired to a non-definition input
    if grep -q '^api:' "$gen_file" 2>/dev/null; then
        skipped=$((skipped + 1))
        continue
    fi

    seed_spec=""
    if [ -f "$SEED_OPENAPI/$api_name/openapi.yml" ]; then
        seed_spec="$SEED_OPENAPI/$api_name/openapi.yml"
    elif [ -f "$SEED_OPENAPI/$api_name/no-custom-config/openapi.yml" ]; then
        seed_spec="$SEED_OPENAPI/$api_name/no-custom-config/openapi.yml"
    fi

    if [ -z "$seed_spec" ]; then
        echo "✗ $api_name (no seed openapi spec)"
        no_seed_spec=$((no_seed_spec + 1))
        continue
    fi

    cp "$seed_spec" "$dir/openapi.yml"

    # Generate overrides if a definition/ directory exists (needed for group/method naming)
    if [ -d "$dir/definition" ]; then
        python3 "$SCRIPT_DIR/generate-openapi-overrides.py" "$dir/openapi.yml" "$dir/openapi-overrides.yml"
    fi

    echo "✓ $api_name"
    copied=$((copied + 1))
done

echo ""
echo "================================"
echo "Copy OpenAPI Specs Results"
echo "================================"
echo "Copied:        $copied"
echo "Skipped:       $skipped (already wired to spec)"
echo "No seed spec:  $no_seed_spec"
echo "================================"
