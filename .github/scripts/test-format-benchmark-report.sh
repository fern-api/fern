#!/usr/bin/env bash
# Tests for format-benchmark-report.sh
# Run: bash .github/scripts/test-format-benchmark-report.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPORT_SCRIPT="${SCRIPT_DIR}/format-benchmark-report.sh"
PASS=0
FAIL=0
ALL_TEMP_DIRS=()

cleanup() {
  for d in "${ALL_TEMP_DIRS[@]}"; do
    rm -rf "$d"
  done
}
trap cleanup EXIT

setup_dirs() {
  PR_DIR=$(mktemp -d)
  MAIN_DIR=$(mktemp -d)
  ALL_TEMP_DIRS+=("$PR_DIR" "$MAIN_DIR")
}

assert_contains() {
  local output="$1"
  local expected="$2"
  local test_name="$3"
  if echo "$output" | grep -qF "$expected"; then
    echo "  PASS: $test_name"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: $test_name"
    echo "    Expected to contain: $expected"
    echo "    Got: $output"
    FAIL=$((FAIL + 1))
  fi
}

assert_not_contains() {
  local output="$1"
  local unexpected="$2"
  local test_name="$3"
  if echo "$output" | grep -qF "$unexpected"; then
    echo "  FAIL: $test_name"
    echo "    Should NOT contain: $unexpected"
    FAIL=$((FAIL + 1))
  else
    echo "  PASS: $test_name"
    PASS=$((PASS + 1))
  fi
}

# Test 1: Basic report with matching PR and main results (flat baseline, no E2E)
test_basic_report() {
  echo "Test: Basic report with matching results"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":180,"exit_code":0}' > "$MAIN_DIR/ts-sdk.jsonl"

  OUTPUT=$(bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "## SDK Generation Benchmark Results" "Has header"
  assert_contains "$OUTPUT" "| ts-sdk | square | 180s | N/A | 200s | +20s (+11.1%) |" "Shows correct delta with E2E N/A"
  assert_contains "$OUTPUT" "main (generator)" "Has generator-only column header"
  assert_contains "$OUTPUT" "main (E2E)" "Has E2E column header"
}

# Test 2: Negative delta (improvement)
test_negative_delta() {
  echo "Test: Negative delta (performance improvement)"
  setup_dirs
  echo '{"generator":"python-sdk","spec":"square","duration_seconds":90,"exit_code":0}' > "$PR_DIR/python-sdk.jsonl"
  echo '{"generator":"python-sdk","spec":"square","duration_seconds":100,"exit_code":0}' > "$MAIN_DIR/python-sdk.jsonl"

  OUTPUT=$(bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "| python-sdk | square | 100s | N/A | 90s | -10s (-10.0%) |" "Shows negative delta"
}

# Test 3: Non-zero exit code shows warning marker
test_nonzero_exit() {
  echo "Test: Non-zero exit code shows warning"
  setup_dirs
  echo '{"generator":"go-sdk","spec":"square","duration_seconds":50,"exit_code":1}' > "$PR_DIR/go-sdk.jsonl"
  echo '{"generator":"go-sdk","spec":"square","duration_seconds":45,"exit_code":0}' > "$MAIN_DIR/go-sdk.jsonl"

  OUTPUT=$(bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "50s ⚠️" "Shows warning marker for non-zero exit"
}

# Test 4: Missing main results shows N/A
test_missing_main() {
  echo "Test: Missing main results shows N/A"
  setup_dirs
  echo '{"generator":"java-sdk","spec":"square","duration_seconds":120,"exit_code":0}' > "$PR_DIR/java-sdk.jsonl"
  # No main results

  OUTPUT=$(bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "| java-sdk | square | N/A | N/A | 120s | N/A |" "Shows N/A for missing main and E2E"
}

# Test 5: Skipped spec shows skip marker
test_skipped_spec() {
  echo "Test: Skipped spec shows skip marker"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":0,"exit_code":-1,"skipped":true}' > "$PR_DIR/ts-sdk.jsonl"

  OUTPUT=$(bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "skipped" "Shows skipped marker"
  assert_not_contains "$OUTPUT" "0s" "Does not show 0s duration for skipped"
}

# Test 6: Multiple generators
test_multiple_generators() {
  echo "Test: Multiple generators produce multiple rows"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"
  echo '{"generator":"python-sdk","spec":"square","duration_seconds":150,"exit_code":0}' > "$PR_DIR/python-sdk.jsonl"
  echo '{"generator":"go-sdk","spec":"square","duration_seconds":100,"exit_code":0}' > "$PR_DIR/go-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":190,"exit_code":0}' > "$MAIN_DIR/ts-sdk.jsonl"
  echo '{"generator":"python-sdk","spec":"square","duration_seconds":140,"exit_code":0}' > "$MAIN_DIR/python-sdk.jsonl"
  echo '{"generator":"go-sdk","spec":"square","duration_seconds":95,"exit_code":0}' > "$MAIN_DIR/go-sdk.jsonl"

  OUTPUT=$(bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "| ts-sdk | square |" "Has ts-sdk square row"
  assert_contains "$OUTPUT" "| python-sdk | square |" "Has python-sdk square row"
  assert_contains "$OUTPUT" "| go-sdk | square |" "Has go-sdk square row"
}

# Test 7: Empty PR directory produces valid report structure
test_empty_results() {
  echo "Test: Empty results directory still produces valid markdown"
  setup_dirs

  OUTPUT=$(bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "## SDK Generation Benchmark Results" "Has header even with no data"
  assert_contains "$OUTPUT" "</details>" "Has closing details tag"
}

# Test 8: Baseline timestamp shown when BASELINE_TIMESTAMP is set (legacy flat format)
test_baseline_timestamp() {
  echo "Test: Baseline timestamp shown in header (legacy flat)"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":180,"exit_code":0}' > "$MAIN_DIR/ts-sdk.jsonl"

  OUTPUT=$(BASELINE_TIMESTAMP="2026-03-30T04:00:00Z" bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "latest nightly baseline" "Shows nightly baseline label"
  assert_contains "$OUTPUT" "2026-03-30T04:00:00Z" "Shows baseline timestamp"
  assert_contains "$OUTPUT" "benchmark-baseline" "Shows link to refresh workflow"
}

# Test 9: No baseline timestamp when BASELINE_TIMESTAMP is unset
test_no_baseline_timestamp() {
  echo "Test: No baseline timestamp when unset"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"

  OUTPUT=$(unset BASELINE_TIMESTAMP; bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_not_contains "$OUTPUT" "cached" "Does not show cached label without timestamp"
  assert_contains "$OUTPUT" "Comparing PR branch against" "Shows generic comparison header"
}

# Test 10: Median baseline from history (odd number of runs)
test_history_median_odd() {
  echo "Test: Median from 3 history runs (odd)"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"

  # Create 3 history entries: 170, 180, 190 -> median = 180
  mkdir -p "$MAIN_DIR/history/2026-03-28_1"
  mkdir -p "$MAIN_DIR/history/2026-03-29_2"
  mkdir -p "$MAIN_DIR/history/2026-03-30_3"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":190,"exit_code":0}' > "$MAIN_DIR/history/2026-03-28_1/ts-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":170,"exit_code":0}' > "$MAIN_DIR/history/2026-03-29_2/ts-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":180,"exit_code":0}' > "$MAIN_DIR/history/2026-03-30_3/ts-sdk.jsonl"

  OUTPUT=$(BASELINE_TIMESTAMP="2026-03-30T04:00:00Z" bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "180s (n=3)" "Shows median with run count"
  assert_contains "$OUTPUT" "+20s (+11.1%)" "Shows correct delta against median"
  assert_contains "$OUTPUT" "median of 3 nightly run(s)" "Header shows history count"
}

# Test 11: Median baseline from history (even number of runs)
test_history_median_even() {
  echo "Test: Median from 4 history runs (even)"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"

  # Create 4 history entries: 170, 180, 190, 200 -> median = (180+190)/2 = 185
  mkdir -p "$MAIN_DIR/history/2026-03-27_1"
  mkdir -p "$MAIN_DIR/history/2026-03-28_2"
  mkdir -p "$MAIN_DIR/history/2026-03-29_3"
  mkdir -p "$MAIN_DIR/history/2026-03-30_4"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$MAIN_DIR/history/2026-03-27_1/ts-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":170,"exit_code":0}' > "$MAIN_DIR/history/2026-03-28_2/ts-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":190,"exit_code":0}' > "$MAIN_DIR/history/2026-03-29_3/ts-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":180,"exit_code":0}' > "$MAIN_DIR/history/2026-03-30_4/ts-sdk.jsonl"

  OUTPUT=$(BASELINE_TIMESTAMP="2026-03-30T04:00:00Z" bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "185s (n=4)" "Shows median of even count with run count"
  assert_contains "$OUTPUT" "+15s (+8.1%)" "Shows correct delta against even median"
}

# Test 12: History with single run falls back gracefully (no n= suffix)
test_history_single_run() {
  echo "Test: History with single run shows no n= suffix"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"

  mkdir -p "$MAIN_DIR/history/2026-03-30_1"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":180,"exit_code":0}' > "$MAIN_DIR/history/2026-03-30_1/ts-sdk.jsonl"

  OUTPUT=$(bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "| ts-sdk | square | 180s | N/A | 200s |" "Shows single-run without n= suffix, E2E N/A"
  assert_not_contains "$OUTPUT" "n=" "No n= for single history run"
}

# Test 13: Empty history directory shows N/A
test_history_empty() {
  echo "Test: Empty history directory shows N/A"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"
  mkdir -p "$MAIN_DIR/history"

  OUTPUT=$(bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "| ts-sdk | square | N/A | N/A | 200s | N/A |" "Shows N/A for empty history (both cols)"
}

# Test 14: History with partial generator coverage
test_history_partial_coverage() {
  echo "Test: History with partial generator coverage"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"
  echo '{"generator":"go-sdk","spec":"square","duration_seconds":150,"exit_code":0}' > "$PR_DIR/go-sdk.jsonl"

  # Only ts-sdk has history, go-sdk does not
  mkdir -p "$MAIN_DIR/history/2026-03-29_1"
  mkdir -p "$MAIN_DIR/history/2026-03-30_2"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":180,"exit_code":0}' > "$MAIN_DIR/history/2026-03-29_1/ts-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":190,"exit_code":0}' > "$MAIN_DIR/history/2026-03-30_2/ts-sdk.jsonl"

  OUTPUT=$(bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "| ts-sdk | square | 185s (n=2)" "ts-sdk has median from history"
  assert_contains "$OUTPUT" "| go-sdk | square | N/A | N/A | 150s | N/A |" "go-sdk shows N/A for both columns"
}

# Test 15: E2E column shows data from history e2e/ subdirectories
test_e2e_column_with_history() {
  echo "Test: E2E column populated from history e2e/ subdirectories"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":50,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"

  # Create history with both generator-only and E2E results
  mkdir -p "$MAIN_DIR/history/2026-03-29_1/e2e"
  mkdir -p "$MAIN_DIR/history/2026-03-30_2/e2e"
  # Generator-only: 40, 45 -> median = 42 (rounded from 42.5)
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":40,"exit_code":0}' > "$MAIN_DIR/history/2026-03-29_1/ts-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":45,"exit_code":0}' > "$MAIN_DIR/history/2026-03-30_2/ts-sdk.jsonl"
  # E2E: 200, 210 -> median = 205
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$MAIN_DIR/history/2026-03-29_1/e2e/ts-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":210,"exit_code":0}' > "$MAIN_DIR/history/2026-03-30_2/e2e/ts-sdk.jsonl"

  OUTPUT=$(BASELINE_TIMESTAMP="2026-03-30T04:00:00Z" bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "42s (n=2)" "Generator-only median shown"
  assert_contains "$OUTPUT" "205s (n=2)" "E2E median shown in E2E column"
}

# Test 16: E2E column shows N/A when no e2e/ subdirectories exist
test_e2e_column_missing() {
  echo "Test: E2E column shows N/A when no e2e/ data exists"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":50,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"

  # History with generator-only results but no e2e/
  mkdir -p "$MAIN_DIR/history/2026-03-30_1"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":45,"exit_code":0}' > "$MAIN_DIR/history/2026-03-30_1/ts-sdk.jsonl"

  OUTPUT=$(bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "| ts-sdk | square | 45s | N/A | 50s |" "Generator baseline shown, E2E is N/A"
}

# Test 17: E2E column with partial coverage (some generators have E2E, others don't)
test_e2e_partial_coverage() {
  echo "Test: E2E column with partial generator coverage"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":50,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"
  echo '{"generator":"go-sdk","spec":"square","duration_seconds":100,"exit_code":0}' > "$PR_DIR/go-sdk.jsonl"

  # ts-sdk has both gen + E2E; go-sdk has only gen
  mkdir -p "$MAIN_DIR/history/2026-03-30_1/e2e"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":45,"exit_code":0}' > "$MAIN_DIR/history/2026-03-30_1/ts-sdk.jsonl"
  echo '{"generator":"go-sdk","spec":"square","duration_seconds":95,"exit_code":0}' > "$MAIN_DIR/history/2026-03-30_1/go-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$MAIN_DIR/history/2026-03-30_1/e2e/ts-sdk.jsonl"
  # No e2e/go-sdk.jsonl

  OUTPUT=$(bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "| ts-sdk | square | 45s | 200s | 50s |" "ts-sdk has both gen and E2E"
  assert_contains "$OUTPUT" "| go-sdk | square | 95s | N/A | 100s |" "go-sdk has gen but E2E is N/A"
}

# Test 18: E2E median with odd number of runs
test_e2e_median_odd() {
  echo "Test: E2E median from 3 history runs (odd)"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":50,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"

  mkdir -p "$MAIN_DIR/history/2026-03-28_1/e2e"
  mkdir -p "$MAIN_DIR/history/2026-03-29_2/e2e"
  mkdir -p "$MAIN_DIR/history/2026-03-30_3/e2e"
  # Generator-only
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":45,"exit_code":0}' > "$MAIN_DIR/history/2026-03-28_1/ts-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":45,"exit_code":0}' > "$MAIN_DIR/history/2026-03-29_2/ts-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":45,"exit_code":0}' > "$MAIN_DIR/history/2026-03-30_3/ts-sdk.jsonl"
  # E2E: 190, 200, 210 -> median = 200
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":210,"exit_code":0}' > "$MAIN_DIR/history/2026-03-28_1/e2e/ts-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":190,"exit_code":0}' > "$MAIN_DIR/history/2026-03-29_2/e2e/ts-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$MAIN_DIR/history/2026-03-30_3/e2e/ts-sdk.jsonl"

  OUTPUT=$(BASELINE_TIMESTAMP="2026-03-30T04:00:00Z" bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "200s (n=3)" "E2E shows median with run count"
}

# Test 19: PostHog baseline JSON payload is valid (dry-run, no network call)
test_posthog_baseline_json() {
  echo "Test: PostHog baseline event JSON is well-formed"
  local gen="ts-sdk" spec="square" dur=180 ec=0 skipped=false mode="generator-only"
  local api_key="phc_test_key" timestamp="2026-03-30T04:00:00Z"
  local commit_sha="abc123" run_id="12345" run_url="https://github.com/fern-api/fern/actions/runs/12345"

  local payload
  payload=$(jq -n \
    --arg api_key "$api_key" \
    --arg event "benchmark-baseline-result" \
    --arg distinct_id "fern-ci-benchmark" \
    --arg timestamp "$timestamp" \
    --arg generator "$gen" \
    --arg spec "$spec" \
    --argjson duration_seconds "$dur" \
    --argjson exit_code "$ec" \
    --argjson skipped "$skipped" \
    --arg mode "$mode" \
    --arg branch "main" \
    --arg commit_sha "$commit_sha" \
    --arg run_id "$run_id" \
    --arg run_url "$run_url" \
    '{
      api_key: $api_key,
      event: $event,
      distinct_id: $distinct_id,
      timestamp: $timestamp,
      properties: {
        generator: $generator,
        spec: $spec,
        duration_seconds: $duration_seconds,
        exit_code: $exit_code,
        skipped: $skipped,
        mode: $mode,
        branch: $branch,
        commit_sha: $commit_sha,
        run_id: $run_id,
        run_url: $run_url
      }
    }')

  # Validate JSON is parseable
  if echo "$payload" | jq empty 2>/dev/null; then
    PASS=$((PASS + 1))
    echo "  PASS: Baseline JSON is valid"
  else
    FAIL=$((FAIL + 1))
    echo "  FAIL: Baseline JSON is invalid"
    echo "    Payload: $payload"
  fi

  # Validate key fields
  assert_contains "$payload" '"event": "benchmark-baseline-result"' "Has correct event name"
  assert_contains "$payload" '"generator": "ts-sdk"' "Has generator field"
  assert_contains "$payload" '"duration_seconds": 180' "Has numeric duration (not string)"
  assert_contains "$payload" '"skipped": false' "Has boolean skipped (not string)"
}

# Test 20: PostHog PR JSON payload is valid (dry-run, no network call)
test_posthog_pr_json() {
  echo "Test: PostHog PR event JSON is well-formed"
  local gen="python-sdk" spec="square" dur=95 ec=0 skipped=false
  local api_key="phc_test_key" timestamp="2026-03-30T04:00:00Z"
  local pr_branch="feat/my-feature" pr_number=42 pr_sha="def456"
  local run_id="67890" run_url="https://github.com/fern-api/fern/actions/runs/67890"

  local payload
  payload=$(jq -n \
    --arg api_key "$api_key" \
    --arg event "benchmark-pr-result" \
    --arg distinct_id "fern-ci-benchmark" \
    --arg timestamp "$timestamp" \
    --arg generator "$gen" \
    --arg spec "$spec" \
    --argjson duration_seconds "$dur" \
    --argjson exit_code "$ec" \
    --argjson skipped "$skipped" \
    --arg mode "generator-only" \
    --arg branch "$pr_branch" \
    --argjson pr_number "$pr_number" \
    --arg commit_sha "$pr_sha" \
    --arg run_id "$run_id" \
    --arg run_url "$run_url" \
    '{
      api_key: $api_key,
      event: $event,
      distinct_id: $distinct_id,
      timestamp: $timestamp,
      properties: {
        generator: $generator,
        spec: $spec,
        duration_seconds: $duration_seconds,
        exit_code: $exit_code,
        skipped: $skipped,
        mode: $mode,
        branch: $branch,
        pr_number: $pr_number,
        commit_sha: $commit_sha,
        run_id: $run_id,
        run_url: $run_url
      }
    }')

  # Validate JSON is parseable
  if echo "$payload" | jq empty 2>/dev/null; then
    PASS=$((PASS + 1))
    echo "  PASS: PR JSON is valid"
  else
    FAIL=$((FAIL + 1))
    echo "  FAIL: PR JSON is invalid"
    echo "    Payload: $payload"
  fi

  # Validate key fields
  assert_contains "$payload" '"event": "benchmark-pr-result"' "Has correct PR event name"
  assert_contains "$payload" '"pr_number": 42' "Has numeric pr_number"
  assert_contains "$payload" '"branch": "feat/my-feature"' "Has branch name"
  assert_contains "$payload" '"duration_seconds": 95' "Has numeric duration"
}

# Test 21: PostHog JSON handles special characters in branch names safely
test_posthog_special_chars() {
  echo "Test: PostHog JSON handles special characters in branch name"
  local branch_name='feat/test"branch$(echo pwned)' 

  local payload
  payload=$(jq -n \
    --arg api_key "phc_test" \
    --arg event "benchmark-pr-result" \
    --arg distinct_id "fern-ci-benchmark" \
    --arg timestamp "2026-03-30T04:00:00Z" \
    --arg branch "$branch_name" \
    '{
      api_key: $api_key,
      event: $event,
      distinct_id: $distinct_id,
      timestamp: $timestamp,
      properties: { branch: $branch }
    }')

  # jq should properly escape the special chars
  if echo "$payload" | jq empty 2>/dev/null; then
    PASS=$((PASS + 1))
    echo "  PASS: JSON with special chars is valid"
  else
    FAIL=$((FAIL + 1))
    echo "  FAIL: JSON with special chars is invalid"
  fi

  # The branch name should be preserved (with escaping) in the JSON
  local extracted
  extracted=$(echo "$payload" | jq -r '.properties.branch')
  if [ "$extracted" = "$branch_name" ]; then
    PASS=$((PASS + 1))
    echo "  PASS: Branch name with special chars round-trips correctly"
  else
    FAIL=$((FAIL + 1))
    echo "  FAIL: Branch name mangled: expected '$branch_name', got '$extracted'"
  fi
}

# Run all tests
echo "=== format-benchmark-report.sh tests ==="
echo ""
test_basic_report
test_negative_delta
test_nonzero_exit
test_missing_main
test_skipped_spec
test_multiple_generators
test_empty_results
test_baseline_timestamp
test_no_baseline_timestamp
test_history_median_odd
test_history_median_even
test_history_single_run
test_history_empty
test_history_partial_coverage
test_e2e_column_with_history
test_e2e_column_missing
test_e2e_partial_coverage
test_e2e_median_odd

# Test 22: E2E column from flat e2e/ directory (artifacts API layout)
test_e2e_flat_layout() {
  echo "Test: E2E column populated from flat e2e/ directory (artifacts API)"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":50,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"

  # Flat layout: generator-only at root, E2E in e2e/ subdir
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":45,"exit_code":0}' > "$MAIN_DIR/ts-sdk.jsonl"
  mkdir -p "$MAIN_DIR/e2e"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$MAIN_DIR/e2e/ts-sdk.jsonl"

  OUTPUT=$(BASELINE_TIMESTAMP="2026-04-06T04:00:00Z" bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "| ts-sdk | square | 45s | 200s | 50s |" "Flat layout: both gen and E2E shown"
  assert_contains "$OUTPUT" "latest nightly baseline" "Flat layout: shows nightly baseline label"
}

test_e2e_flat_layout

# Test 23: Report includes sentinel marker for comment upsert
test_sentinel_marker() {
  echo "Test: Report includes sentinel HTML comment for upsert"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"

  OUTPUT=$(bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "<!-- fern-sdk-benchmark-results -->" "Has sentinel marker"
}

test_sentinel_marker

# Test 24: Report includes "Last updated" timestamp
test_last_updated_timestamp() {
  echo "Test: Report includes last updated timestamp"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"

  OUTPUT=$(bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "Last updated:" "Has last updated timestamp"
  assert_contains "$OUTPUT" "UTC" "Timestamp includes UTC"
}

test_last_updated_timestamp
echo ""
echo "=== PostHog JSON validation tests ==="
echo ""
test_posthog_baseline_json
test_posthog_pr_json
test_posthog_special_chars

echo ""
echo "=== Results: ${PASS} passed, ${FAIL} failed ==="
[ "$FAIL" -eq 0 ] || exit 1
