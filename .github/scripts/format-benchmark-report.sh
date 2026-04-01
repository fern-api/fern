#!/usr/bin/env bash
# Formats benchmark results into a markdown PR comment.
# Usage: format-benchmark-report.sh <pr-results-dir> <main-results-dir>
#
# Each directory contains .jsonl files with one JSON object per line:
#   {"generator":"ts-sdk","spec":"square","duration_seconds":45}
#
# The main-results-dir may contain either:
#   - Flat .jsonl files (single baseline, legacy format)
#   - A history/ subdirectory with dated run folders, each containing .jsonl files.
#     When history exists, the median of all historical runs is used as the baseline.
#     E2E results are stored in history/<run>/e2e/ subdirectories.

set -euo pipefail

PR_DIR="${1:?Usage: format-benchmark-report.sh <pr-results-dir> <main-results-dir>}"
MAIN_DIR="${2:?Usage: format-benchmark-report.sh <pr-results-dir> <main-results-dir>}"

# Compute median of a list of numbers (one per line on stdin)
compute_median() {
  sort -n | awk '{a[NR]=$1} END {
    if (NR==0) { print "N/A"; exit }
    if (NR%2==1) { print a[(NR+1)/2] }
    else { printf "%.0f\n", (a[NR/2] + a[NR/2+1]) / 2 }
  }'
}

# Look up E2E baseline duration for a given generator+spec.
# Reads from history/<run>/e2e/ subdirectories.
# Sets: E2E_BASELINE_VAL, E2E_BASELINE_RUNS
lookup_e2e_baseline() {
  local generator="$1"
  local spec="$2"
  E2E_BASELINE_VAL="N/A"
  E2E_BASELINE_RUNS=0

  if [ -d "${MAIN_DIR}/history" ]; then
    local durations=()
    for run_dir in "${MAIN_DIR}/history"/*/; do
      [ -d "$run_dir" ] || continue
      local e2e_file="${run_dir}e2e/${generator}.jsonl"
      [ -f "$e2e_file" ] || continue
      local dur
      dur=$(jq -r --arg spec "$spec" 'select(.spec == $spec) | .duration_seconds' "$e2e_file" 2>/dev/null || true)
      if [ -n "$dur" ] && [ "$dur" != "null" ] && [ "$dur" != "0" ]; then
        durations+=("$dur")
      fi
    done

    E2E_BASELINE_RUNS=${#durations[@]}
    if [ "$E2E_BASELINE_RUNS" -gt 0 ]; then
      E2E_BASELINE_VAL=$(printf '%s\n' "${durations[@]}" | compute_median)
    fi
  fi
}

# Look up baseline duration for a given generator+spec.
# If history/ exists, computes median across all historical runs.
# Otherwise falls back to flat .jsonl lookup (legacy/single-run format).
# Sets: BASELINE_VAL, BASELINE_RUNS
lookup_baseline() {
  local generator="$1"
  local spec="$2"
  BASELINE_VAL="N/A"
  BASELINE_RUNS=0

  if [ -d "${MAIN_DIR}/history" ]; then
    local durations=()
    for run_dir in "${MAIN_DIR}/history"/*/; do
      [ -d "$run_dir" ] || continue
      local hist_file="${run_dir}/${generator}.jsonl"
      [ -f "$hist_file" ] || continue
      local dur
      dur=$(jq -r --arg spec "$spec" 'select(.spec == $spec) | .duration_seconds' "$hist_file" 2>/dev/null || true)
      if [ -n "$dur" ] && [ "$dur" != "null" ] && [ "$dur" != "0" ]; then
        durations+=("$dur")
      fi
    done

    BASELINE_RUNS=${#durations[@]}
    if [ "$BASELINE_RUNS" -gt 0 ]; then
      BASELINE_VAL=$(printf '%s\n' "${durations[@]}" | compute_median)
    fi
  else
    local main_file="${MAIN_DIR}/${generator}.jsonl"
    if [ -f "$main_file" ]; then
      local main_line
      main_line=$(jq -c --arg spec "$spec" 'select(.spec == $spec)' "$main_file" 2>/dev/null || true)
      if [ -n "$main_line" ]; then
        local val
        val=$(echo "$main_line" | jq -r '.duration_seconds')
        if [ "$val" != "0" ] && [ "$val" != "N/A" ]; then
          BASELINE_VAL="$val"
          BASELINE_RUNS=1
        fi
      fi
    fi
  fi
}

echo "## SDK Generation Benchmark Results"
echo ""
if [ -n "${BASELINE_TIMESTAMP:-}" ]; then
  if [ -d "${MAIN_DIR}/history" ]; then
    HISTORY_COUNT=$(ls -d "${MAIN_DIR}/history"/*/ 2>/dev/null | wc -l)
    echo "Comparing PR branch against **median of ${HISTORY_COUNT} nightly run(s)** on \`main\` (latest: ${BASELINE_TIMESTAMP})."
  else
    echo "Comparing PR branch against cached \`main\` baseline (generated ${BASELINE_TIMESTAMP})."
  fi
else
  echo "Comparing PR branch against \`main\` baseline."
fi
echo ""
echo "<details>"
echo "<summary>Full benchmark table (click to expand)</summary>"
echo ""
echo "| Generator | Spec | main (generator) | main (E2E) | PR (generator) | Delta |"
echo "|-----------|------|------------------|------------|----------------|-------|"

# Collect all results from the PR directory, then sort rows by generator name for
# deterministic output regardless of filesystem glob order or artifact download timing.
TABLE_ROWS=""
for PR_FILE in "${PR_DIR}"/*.jsonl; do
  [ -f "$PR_FILE" ] || continue

  while IFS= read -r LINE; do
    GENERATOR=$(echo "$LINE" | jq -r '.generator')
    SPEC=$(echo "$LINE" | jq -r '.spec')
    PR_DURATION=$(echo "$LINE" | jq -r '.duration_seconds')
    PR_EXIT=$(echo "$LINE" | jq -r '.exit_code // 0')

    # Look up baselines (median if history exists, single value otherwise)
    lookup_baseline "$GENERATOR" "$SPEC"
    lookup_e2e_baseline "$GENERATOR" "$SPEC"
    DELTA="N/A"

    if [ "$BASELINE_VAL" != "N/A" ] && [ "$BASELINE_VAL" != "0" ]; then
      DIFF=$(( PR_DURATION - BASELINE_VAL ))
      if [ "$BASELINE_VAL" -gt 0 ]; then
        PCT=$(awk "BEGIN {printf \"%.1f\", ($DIFF / $BASELINE_VAL) * 100}")
        if [ "$DIFF" -ge 0 ]; then
          DELTA="+${DIFF}s (+${PCT}%)"
        else
          DELTA="${DIFF}s (${PCT}%)"
        fi
      fi
      if [ "$BASELINE_RUNS" -gt 1 ]; then
        MAIN_DISPLAY="${BASELINE_VAL}s (n=${BASELINE_RUNS})"
      else
        MAIN_DISPLAY="${BASELINE_VAL}s"
      fi
    else
      MAIN_DISPLAY="N/A"
    fi

    # Format E2E baseline display
    if [ "$E2E_BASELINE_VAL" != "N/A" ] && [ "$E2E_BASELINE_VAL" != "0" ]; then
      if [ "$E2E_BASELINE_RUNS" -gt 1 ]; then
        E2E_DISPLAY="${E2E_BASELINE_VAL}s (n=${E2E_BASELINE_RUNS})"
      else
        E2E_DISPLAY="${E2E_BASELINE_VAL}s"
      fi
    else
      E2E_DISPLAY="N/A"
    fi

    # Check if this spec was skipped (fetch failure)
    PR_SKIPPED=$(echo "$LINE" | jq -r '.skipped // false')
    if [ "$PR_SKIPPED" = "true" ]; then
      TABLE_ROWS+="| ${GENERATOR} | ${SPEC} | — | — | ⏭️ skipped | — |\n"
      continue
    fi

    PR_DISPLAY="${PR_DURATION}s"
    if [ "$PR_EXIT" != "0" ] && [ "$PR_EXIT" != "null" ]; then
      PR_DISPLAY="${PR_DURATION}s ⚠️"
    fi

    TABLE_ROWS+="| ${GENERATOR} | ${SPEC} | ${MAIN_DISPLAY} | ${E2E_DISPLAY} | ${PR_DISPLAY} | ${DELTA} |\n"
  done < "$PR_FILE"
done

# Sort rows alphabetically by generator name (first column) for consistent ordering
printf '%b' "$TABLE_ROWS" | sort -t'|' -k2,2

echo ""
echo "</details>"
echo ""
echo "_**main (generator)**: generator-only time via --skip-scripts (includes Docker image build, container startup, IR parsing, and code generation — this is the same Docker-based flow customers use via \`fern generate\`). **main (E2E)**: full customer-observable time including build/test scripts (nightly baseline, informational). **Delta** is computed against generator-only baseline._"
echo "_⚠️ = generation exited with a non-zero exit code (timing may not reflect a successful run)._"
if [ -n "${BASELINE_TIMESTAMP:-}" ]; then
  echo "_Baseline from nightly runs on \`main\` (latest: ${BASELINE_TIMESTAMP}). Trigger [benchmark-baseline](../actions/workflows/benchmark-baseline.yml) to refresh._"
fi
