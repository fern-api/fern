#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SEED_OPENAPI="$REPO_ROOT/seed/openapi"
MAX_PARALLEL="${MAX_PARALLEL:-10}"
RESULTS_DIR="$REPO_ROOT/.local/tmp"
mkdir -p "$RESULTS_DIR"
rm -f "$RESULTS_DIR"/*.result "$RESULTS_DIR"/*.stdout

cd "$REPO_ROOT"

# ---------------------------------------------------------------------------
# Step 1: For each test-definition API, find its seed openapi spec
# ---------------------------------------------------------------------------
apis=()
no_seed_spec=0
no_seed_spec_apis=()

for dir in test-definitions/fern/apis/*/; do
    api_name=$(basename "$dir")

    seed_spec=""
    if [ -f "$SEED_OPENAPI/$api_name/openapi.yml" ]; then
        seed_spec="$SEED_OPENAPI/$api_name/openapi.yml"
    elif [ -f "$SEED_OPENAPI/$api_name/no-custom-config/openapi.yml" ]; then
        seed_spec="$SEED_OPENAPI/$api_name/no-custom-config/openapi.yml"
    fi

    if [ -z "$seed_spec" ]; then
        no_seed_spec=$((no_seed_spec + 1))
        no_seed_spec_apis+=("$api_name")
        continue
    fi

    apis+=("$api_name")
done

total=${#apis[@]}
echo "Found $total APIs with seed openapi specs ($no_seed_spec without)"

# ---------------------------------------------------------------------------
# Step 2: Validate seed specs with Spectral
# ---------------------------------------------------------------------------
echo ""
echo "Validating specs with Spectral..."

find_seed_spec() {
    local api_name="$1"
    if [ -f "$SEED_OPENAPI/$api_name/openapi.yml" ]; then
        echo "$SEED_OPENAPI/$api_name/openapi.yml"
    elif [ -f "$SEED_OPENAPI/$api_name/no-custom-config/openapi.yml" ]; then
        echo "$SEED_OPENAPI/$api_name/no-custom-config/openapi.yml"
    fi
}

run_spectral() {
    local api_name="$1"
    local results_dir="$2"
    local output_file="$results_dir/$api_name"
    local seed_spec
    seed_spec=$(find_seed_spec "$api_name")

    if npx --yes @stoplight/spectral-cli lint "$seed_spec" > "$output_file.stdout" 2>&1; then
        echo "pass" > "$output_file.result"
        echo "✓ $api_name"
    else
        # Spectral exits non-zero for warnings too; check if there are actual errors
        if grep -q "error" "$output_file.stdout" 2>/dev/null; then
            echo "fail" > "$output_file.result"
            echo "✗ $api_name"
        else
            echo "pass" > "$output_file.result"
            echo "✓ $api_name (warnings only)"
        fi
    fi
}

export -f run_spectral find_seed_spec
export SEED_OPENAPI RESULTS_DIR

printf '%s\n' "${apis[@]}" | xargs -P "$MAX_PARALLEL" -I {} bash -c 'run_spectral "$@"' _ {} "$RESULTS_DIR"

# ---------------------------------------------------------------------------
# Step 3: Tally results
# ---------------------------------------------------------------------------
passed=0
failed=0
failed_apis=()

for api_name in "${apis[@]}"; do
    result=$(cat "$RESULTS_DIR/$api_name.result" 2>/dev/null || echo "fail")
    if [ "$result" = "pass" ]; then
        passed=$((passed + 1))
    else
        failed=$((failed + 1))
        failed_apis+=("$api_name")
    fi
done

# ---------------------------------------------------------------------------
# Step 4: Print summary
# ---------------------------------------------------------------------------
echo ""
echo "================================"
echo "OpenAPI Spec Validation Results"
echo "================================"
echo "Total:          $total"
echo "Passed:         $passed"
echo "Failed:         $failed"
echo "No seed spec:   $no_seed_spec"
echo "================================"

if [ ${#no_seed_spec_apis[@]} -gt 0 ]; then
    echo ""
    echo "APIs missing seed openapi spec:"
    for api in "${no_seed_spec_apis[@]}"; do
        echo "  - $api"
    done
fi

if [ ${#failed_apis[@]} -gt 0 ]; then
    echo ""
    echo "APIs with Spectral errors:"
    for api in "${failed_apis[@]}"; do
        echo "  - $api"
        if [ -f "$RESULTS_DIR/$api.stdout" ]; then
            echo "    Output (last 10 lines):"
            tail -10 "$RESULTS_DIR/$api.stdout" | sed 's/^/      /'
        fi
    done
fi

# GitHub Actions output
if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "total=$total" >> "$GITHUB_OUTPUT"
    echo "passed=$passed" >> "$GITHUB_OUTPUT"
    echo "failed=$failed" >> "$GITHUB_OUTPUT"
    echo "no_seed_spec=$no_seed_spec" >> "$GITHUB_OUTPUT"
fi

# GitHub Actions step summary
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    {
        echo "## OpenAPI Spec Validation Results"
        echo "| Metric | Count |"
        echo "|--------|-------|"
        echo "| Total  | $total |"
        echo "| Passed | $passed |"
        echo "| Failed | $failed |"
        echo "| No seed spec | $no_seed_spec |"
        if [ ${#failed_apis[@]} -gt 0 ]; then
            echo ""
            echo "### APIs with Spectral Errors"
            for api in "${failed_apis[@]}"; do
                echo "- \`$api\`"
            done
        fi
    } >> "$GITHUB_STEP_SUMMARY"
fi

# Exit with failure if any APIs failed validation
if [ "$failed" -gt 0 ]; then
    exit 1
fi
