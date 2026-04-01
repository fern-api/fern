#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MAX_PARALLEL="${MAX_PARALLEL:-10}"
RESULTS_DIR="$REPO_ROOT/.local/tmp"
mkdir -p "$RESULTS_DIR"
rm -f "$RESULTS_DIR"/*.result "$RESULTS_DIR"/*.stdout

# Collect API directories, skipping those that are already OpenAPI specs
cd "$REPO_ROOT/test-definitions"
CLI_PATH="$REPO_ROOT/packages/cli/cli/dist/prod/cli.cjs"
apis=()
skipped=0
for dir in fern/apis/*/; do
    api_name=$(basename "$dir")
    # Skip APIs that use an OpenAPI spec (have "api: specs:" in generators.yml)
    if grep -q "specs:" "$dir/generators.yml" 2>/dev/null; then
        ((skipped++))
        continue
    fi
    apis+=("$api_name")
done

total=${#apis[@]}
echo "Found $total Fern definition APIs to export (skipped $skipped OpenAPI specs)"

# Run exports in parallel
run_export() {
    local api_name="$1"
    local results_dir="$2"
    local output_file="$results_dir/$api_name"

    if FERN_NO_VERSION_REDIRECTION=true node "$CLI_PATH" export "fern/apis/$api_name/openapi.yml" --api "$api_name" > "$output_file.stdout" 2>&1; then
        echo "pass" > "$output_file.result"
        echo "✓ $api_name"
    else
        echo "fail" > "$output_file.result"
        echo "✗ $api_name"
    fi
}

export -f run_export
export CLI_PATH RESULTS_DIR

printf '%s\n' "${apis[@]}" | xargs -P "$MAX_PARALLEL" -I {} bash -c 'run_export "$@"' _ {} "$RESULTS_DIR"

# Tally results
passed=0
failed=0
failed_apis=()

for api_name in "${apis[@]}"; do
    result=$(cat "$RESULTS_DIR/$api_name.result" 2>/dev/null || echo "fail")
    if [ "$result" = "pass" ]; then
        ((passed++))
    else
        ((failed++))
        failed_apis+=("$api_name")
    fi
done

# Print summary
echo ""
echo "================================"
echo "OpenAPI Export Results"
echo "================================"
echo "Total:   $total"
echo "Passed:  $passed"
echo "Failed:  $failed"
echo "Skipped: $skipped (already OpenAPI)"
echo "================================"

if [ ${#failed_apis[@]} -gt 0 ]; then
    echo ""
    echo "Failed APIs:"
    for api in "${failed_apis[@]}"; do
        echo "  - $api"
        # Print last 5 lines of output for failed APIs
        if [ -f "$RESULTS_DIR/$api.stdout" ]; then
            echo "    Output (last 5 lines):"
            tail -5 "$RESULTS_DIR/$api.stdout" | sed 's/^/      /'
        fi
    done
fi

# GitHub Actions output
if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "total=$total" >> "$GITHUB_OUTPUT"
    echo "passed=$passed" >> "$GITHUB_OUTPUT"
    echo "failed=$failed" >> "$GITHUB_OUTPUT"
    echo "skipped=$skipped" >> "$GITHUB_OUTPUT"
fi

# GitHub Actions step summary
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    {
        echo "## OpenAPI Export Results"
        echo "| Metric | Count |"
        echo "|--------|-------|"
        echo "| Total  | $total |"
        echo "| Passed | $passed |"
        echo "| Failed | $failed |"
        echo "| Skipped (already OpenAPI) | $skipped |"
        if [ ${#failed_apis[@]} -gt 0 ]; then
            echo ""
            echo "### Failed APIs"
            for api in "${failed_apis[@]}"; do
                echo "- \`$api\`"
            done
        fi
    } >> "$GITHUB_STEP_SUMMARY"
fi

# Exit with failure if any APIs failed
if [ "$failed" -gt 0 ]; then
    exit 1
fi
