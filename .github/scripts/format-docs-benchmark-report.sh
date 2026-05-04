#!/usr/bin/env bash
# Formats docs benchmark results into a markdown PR comment.
# Usage: format-docs-benchmark-report.sh <pr-results-dir> <baseline-results-dir>
#
# Each directory contains .jsonl files with one JSON object per line:
#   {"type":"docs","spec":"combined","versions_count":30,"duration_seconds":21.3,"exit_code":0}
# duration_seconds may be a float (sub-second precision) or integer.
#
# The baseline-results-dir may contain either:
#   - Flat .jsonl files (single baseline)
#   - A history/ subdirectory with dated run folders, each containing .jsonl files.
#     When history exists, the median of all historical runs is used as the baseline.

set -euo pipefail

PR_DIR="${1:?Usage: format-docs-benchmark-report.sh <pr-results-dir> <baseline-results-dir>}"
BASELINE_DIR="${2:?Usage: format-docs-benchmark-report.sh <pr-results-dir> <baseline-results-dir>}"

# Compute median of a list of numbers (one per line on stdin).
# Supports both integer and float inputs.
compute_median() {
  sort -n | awk '{a[NR]=$1} END {
    if (NR==0) { print "N/A"; exit }
    if (NR%2==1) { printf "%.1f\n", a[(NR+1)/2] }
    else { printf "%.1f\n", (a[NR/2] + a[NR/2+1]) / 2 }
  }'
}

# Look up baseline duration for a given spec.
# If history/ exists, computes median across all historical runs.
# Otherwise falls back to flat .jsonl lookup (single-run format).
# Sets: BASELINE_VAL, BASELINE_RUNS
lookup_docs_baseline() {
  local spec="$1"
  BASELINE_VAL="N/A"
  BASELINE_RUNS=0

  if [ -d "${BASELINE_DIR}/history" ]; then
    local durations=()
    for run_dir in "${BASELINE_DIR}/history"/*/; do
      [ -d "$run_dir" ] || continue
      for f in "${run_dir}"*.jsonl; do
        [ -f "$f" ] || continue
        local dur
        dur=$(jq -r --arg spec "$spec" 'select(.spec == $spec) | .duration_seconds' "$f" 2>/dev/null || true)
        if [ -n "$dur" ] && [ "$dur" != "null" ] && [ "$dur" != "0" ]; then
          durations+=("$dur")
        fi
      done
    done

    BASELINE_RUNS=${#durations[@]}
    if [ "$BASELINE_RUNS" -gt 0 ]; then
      BASELINE_VAL=$(printf '%s\n' "${durations[@]}" | compute_median)
    fi
  else
    for f in "${BASELINE_DIR}"/*.jsonl; do
      [ -f "$f" ] || continue
      local dur
      dur=$(jq -r --arg spec "$spec" 'select(.spec == $spec) | .duration_seconds' "$f" 2>/dev/null || true)
      if [ -n "$dur" ] && [ "$dur" != "null" ] && [ "$dur" != "0" ]; then
        BASELINE_VAL="$dur"
        BASELINE_RUNS=1
        return
      fi
    done
  fi
}

echo "<!-- fern-docs-benchmark-results -->"
echo "## Docs Generation Benchmark Results"
echo ""
if [ -n "${BASELINE_TIMESTAMP:-}" ]; then
  if [ -d "${BASELINE_DIR}/history" ]; then
    HISTORY_COUNT=$(ls -d "${BASELINE_DIR}/history"/*/ 2>/dev/null | wc -l)
    echo "Comparing PR branch against **median of ${HISTORY_COUNT} nightly run(s)** on \`main\` (latest: ${BASELINE_TIMESTAMP})."
  else
    echo "Comparing PR branch against latest nightly baseline on \`main\` (${BASELINE_TIMESTAMP})."
  fi
else
  echo "Comparing PR branch against \`main\` baseline."
fi
echo ""
echo "| Fixture | main | PR | Delta |"
echo "|---------|------|----|-------|"

VERSIONS_COUNT=""

for PR_FILE in "${PR_DIR}"/*.jsonl; do
  [ -f "$PR_FILE" ] || continue

  while IFS= read -r LINE; do
    SPEC=$(echo "$LINE" | jq -r '.spec')
    PR_DURATION=$(echo "$LINE" | jq -r '.duration_seconds')
    PR_EXIT=$(echo "$LINE" | jq -r '.exit_code // 0')
    PR_SKIPPED=$(echo "$LINE" | jq -r '.skipped // false')

    if [ "$PR_SKIPPED" = "true" ]; then
      echo "| docs | — | skipped | — |"
      continue
    fi

    lookup_docs_baseline "$SPEC"
    DELTA="N/A"

    if [ "$BASELINE_VAL" != "N/A" ] && [ "$BASELINE_VAL" != "0" ]; then
      # Use awk for float-safe arithmetic (duration_seconds may be a float)
      DIFF=$(awk "BEGIN {printf \"%.1f\", ${PR_DURATION} - ${BASELINE_VAL}}")
      PCT=$(awk "BEGIN {printf \"%.1f\", ((${PR_DURATION} - ${BASELINE_VAL}) / ${BASELINE_VAL}) * 100}")
      IS_POS=$(awk "BEGIN {print (${PR_DURATION} >= ${BASELINE_VAL}) ? 1 : 0}")
      if [ "$IS_POS" -eq 1 ]; then
        DELTA="+${DIFF}s (+${PCT}%)"
      else
        DELTA="${DIFF}s (${PCT}%)"
      fi
      if [ "$BASELINE_RUNS" -gt 1 ]; then
        MAIN_DISPLAY="${BASELINE_VAL}s (n=${BASELINE_RUNS})"
      else
        MAIN_DISPLAY="${BASELINE_VAL}s"
      fi
    else
      MAIN_DISPLAY="N/A"
    fi

    VERSIONS_COUNT=$(echo "$LINE" | jq -r '.versions_count // "?"')

    PR_ERROR=$(echo "$LINE" | jq -r '.error // empty')

    PR_DISPLAY="${PR_DURATION}s"
    if [ "$VERSIONS_COUNT" != "?" ] && [ "$VERSIONS_COUNT" != "null" ]; then
      PR_DISPLAY="${PR_DURATION}s (${VERSIONS_COUNT} versions)"
    fi
    if [ "$PR_EXIT" != "0" ] && [ "$PR_EXIT" != "null" ]; then
      PR_DISPLAY="${PR_DURATION}s (exit ${PR_EXIT})"
    fi

    echo "| docs | ${MAIN_DISPLAY} | ${PR_DISPLAY} | ${DELTA} |"

    # Show error details if the CLI failed
    if [ -n "$PR_ERROR" ]; then
      echo ""
      echo "<details><summary>CLI error output</summary>"
      echo ""
      echo '```'
      echo "$PR_ERROR"
      echo '```'
      echo "</details>"
      echo ""
    fi
  done < "$PR_FILE"
done

echo ""
echo "_Docs generation runs \`fern generate --docs --preview\` end-to-end against the benchmark fixture with ${VERSIONS_COUNT:-?} API versions (each version: markdown processing + OpenAPI-to-IR + FDR upload)._"
echo "_Delta is computed against the nightly baseline on \`main\`._"
if [ -n "${BASELINE_TIMESTAMP:-}" ]; then
  echo "_Baseline from nightly run(s) on \`main\` (latest: ${BASELINE_TIMESTAMP}). Trigger [benchmark-baseline](../actions/workflows/benchmark-baseline.yml) to refresh._"
fi
echo "_Last updated: $(date -u '+%Y-%m-%d %H:%M') UTC_"
