#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLI_PATH="$REPO_ROOT/packages/cli/cli/dist/prod/cli.cjs"

cd "$REPO_ROOT/test-definitions"

updated=0
skipped=0
failed=0

for dir in fern/apis/*/; do
    api_name=$(basename "$dir")
    gen_file="$dir/generators.yml"

    # Skip APIs that already have a specs section
    if grep -q "specs:" "$gen_file" 2>/dev/null; then
        skipped=$((skipped + 1))
        continue
    fi

    # Export the OpenAPI spec
    if ! FERN_NO_VERSION_REDIRECTION=true node "$CLI_PATH" export "$dir/openapi.yml" --api "$api_name" > /dev/null 2>&1; then
        echo "✗ $api_name (export failed)"
        failed=$((failed + 1))
        continue
    fi

    api_block="api:\n  specs:\n    - openapi: ./openapi.yml"

    if [ ! -f "$gen_file" ]; then
        # Create a new generators.yml with just the specs section
        printf '# yaml-language-server: $schema=../../../../generators-yml.schema.json\n%b\n' "$api_block" > "$gen_file"
    else
        # Build a new file: keep schema comment if present, add api block, then
        # append remaining non-comment non-empty-doc lines
        tmp=$(mktemp)
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
echo "Updated: $updated"
echo "Skipped: $skipped (already have specs)"
echo "Failed:  $failed"
echo "================================"
