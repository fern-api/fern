#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SEED_OPENAPI="$REPO_ROOT/seed/openapi"

cd "$REPO_ROOT/test-definitions"

updated=0
skipped=0
no_seed_spec=0

for dir in fern/apis/*/; do
    api_name=$(basename "$dir")
    gen_file="$dir/generators.yml"

    # Skip APIs that already have a specs section
    if grep -q "specs:" "$gen_file" 2>/dev/null; then
        skipped=$((skipped + 1))
        continue
    fi

    # Find the seed openapi spec
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

    # Copy the seed spec into the test definition directory
    cp "$seed_spec" "$dir/openapi.yml"

    api_block="api:\n  specs:\n    - openapi: ./openapi.yml"

    if [ ! -f "$gen_file" ]; then
        # Create a new generators.yml with just the specs section
        printf '# yaml-language-server: $schema=../../../../generators-yml.schema.json\n%b\n' "$api_block" > "$gen_file"
    else
        # Build a new file: keep schema comment if present, add api block, then
        # append remaining non-comment non-empty-doc lines
        tmp="${TMPDIR:-/tmp}/add-openapi-specs-$$"
        first_line=$(head -1 "$gen_file")
        if echo "$first_line" | grep -q "^# yaml-language-server"; then
            echo "$first_line" > "$tmp"
            printf '%b\n' "$api_block" >> "$tmp"
            # Append rest of file, skipping the schema comment line and bare {}
            tail -n +2 "$gen_file" | grep -v "^{}$" >> "$tmp" || true
        else
            printf '%b\n' "$api_block" > "$tmp"
            # Append existing content, skipping bare {} and existing api: blocks
            grep -v "^{}$" "$gen_file" | grep -v "^api:" >> "$tmp" || true
        fi
        mv "$tmp" "$gen_file"
    fi

    echo "✓ $api_name"
    updated=$((updated + 1))
done

echo ""
echo "================================"
echo "Add OpenAPI Specs Results"
echo "================================"
echo "Updated:       $updated"
echo "Skipped:       $skipped (already have specs)"
echo "No seed spec:  $no_seed_spec"
echo "================================"
