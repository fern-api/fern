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

# Test 1: Basic report with matching PR and main results
test_basic_report() {
  echo "Test: Basic report with matching results"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":180,"exit_code":0}' > "$MAIN_DIR/ts-sdk.jsonl"

  OUTPUT=$(bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "## SDK Generation Benchmark Results" "Has header"
  assert_contains "$OUTPUT" "| ts-sdk | square | 180s | 200s | +20s (+11.1%) |" "Shows correct delta"
  assert_contains "$OUTPUT" "Variance of" "Has variance note"
}

# Test 2: Negative delta (improvement)
test_negative_delta() {
  echo "Test: Negative delta (performance improvement)"
  setup_dirs
  echo '{"generator":"python-sdk","spec":"elevenlabs","duration_seconds":90,"exit_code":0}' > "$PR_DIR/python-sdk.jsonl"
  echo '{"generator":"python-sdk","spec":"elevenlabs","duration_seconds":100,"exit_code":0}' > "$MAIN_DIR/python-sdk.jsonl"

  OUTPUT=$(bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "| python-sdk | elevenlabs | 100s | 90s | -10s (-10.0%) |" "Shows negative delta"
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

  assert_contains "$OUTPUT" "| java-sdk | square | N/A | 120s | N/A |" "Shows N/A for missing main"
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

# Test 6: Multiple generators and specs
test_multiple_generators() {
  echo "Test: Multiple generators produce multiple rows"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"elevenlabs","duration_seconds":300,"exit_code":0}' >> "$PR_DIR/ts-sdk.jsonl"
  echo '{"generator":"python-sdk","spec":"square","duration_seconds":150,"exit_code":0}' > "$PR_DIR/python-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":190,"exit_code":0}' > "$MAIN_DIR/ts-sdk.jsonl"
  echo '{"generator":"ts-sdk","spec":"elevenlabs","duration_seconds":290,"exit_code":0}' >> "$MAIN_DIR/ts-sdk.jsonl"
  echo '{"generator":"python-sdk","spec":"square","duration_seconds":140,"exit_code":0}' > "$MAIN_DIR/python-sdk.jsonl"

  OUTPUT=$(bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "| ts-sdk | square |" "Has ts-sdk square row"
  assert_contains "$OUTPUT" "| ts-sdk | elevenlabs |" "Has ts-sdk elevenlabs row"
  assert_contains "$OUTPUT" "| python-sdk | square |" "Has python-sdk square row"
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

  assert_contains "$OUTPUT" "cached" "Shows cached baseline label"
  assert_contains "$OUTPUT" "2026-03-30T04:00:00Z" "Shows baseline timestamp"
  assert_contains "$OUTPUT" "benchmark-baseline" "Shows link to refresh workflow"
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

  assert_contains "$OUTPUT" "| ts-sdk | square | 180s | 200s |" "Shows single-run without n= suffix"
  assert_not_contains "$OUTPUT" "n=" "No n= for single history run"
}

# Test 13: Empty history directory shows N/A
test_history_empty() {
  echo "Test: Empty history directory shows N/A"
  setup_dirs
  echo '{"generator":"ts-sdk","spec":"square","duration_seconds":200,"exit_code":0}' > "$PR_DIR/ts-sdk.jsonl"
  mkdir -p "$MAIN_DIR/history"

  OUTPUT=$(bash "$REPORT_SCRIPT" "$PR_DIR" "$MAIN_DIR")

  assert_contains "$OUTPUT" "| ts-sdk | square | N/A | 200s | N/A |" "Shows N/A for empty history"
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
  assert_contains "$OUTPUT" "| go-sdk | square | N/A | 150s | N/A |" "go-sdk shows N/A (no history)"
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

echo ""
echo "=== Results: ${PASS} passed, ${FAIL} failed ==="
[ "$FAIL" -eq 0 ] || exit 1
