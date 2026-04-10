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

    if [ ! -f "$gen_file" ]; then
        # Create a new generators.yml with just the specs section
        cat > "$gen_file" <<'EOF'
# yaml-language-server: $schema=../../../../generators-yml.schema.json
api:
  specs:
    - openapi: ./openapi.yml
EOF
    elif head -1 "$gen_file" | grep -q "^# yaml-language-server"; then
        # Insert after the schema comment line
        sed -i '' '1 a\
api:\
  specs:\
    - openapi: ./openapi.yml
' "$gen_file"
    else
        # No schema comment — prepend at the top
        tmp=$(mktemp)
        {
            echo "api:"
            echo "  specs:"
            echo "    - openapi: ./openapi.yml"
            cat "$gen_file"
        } > "$tmp"
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
