#!/usr/bin/env bash
# Formats docs benchmark results into a markdown PR comment.
# Usage: format-docs-benchmark-report.sh <pr-results-dir> <baseline-results-dir>
#
# Each directory contains .jsonl files with one JSON object per line:
#   {"type":"docs","spec":"combined","duration_seconds":21.3,"exit_code":0}
# duration_seconds may be a float (sub-second precision) or integer.

set -euo pipefail

PR_DIR="${1:?Usage: format-docs-benchmark-report.sh <pr-results-dir> <baseline-results-dir>}"
BASELINE_DIR="${2:?Usage: format-docs-benchmark-report.sh <pr-results-dir> <baseline-results-dir>}"

# Look up baseline duration for a given spec.
# Sets: BASELINE_VAL
lookup_docs_baseline() {
  local spec="$1"
  BASELINE_VAL="N/A"

  for f in "${BASELINE_DIR}"/*.jsonl; do
    [ -f "$f" ] || continue
    local dur
    dur=$(jq -r --arg spec "$spec" 'select(.spec == $spec) | .duration_seconds' "$f" 2>/dev/null || true)
    if [ -n "$dur" ] && [ "$dur" != "null" ] && [ "$dur" != "0" ]; then
      BASELINE_VAL="$dur"
      return
    fi
  done
}

echo "<!-- fern-docs-benchmark-results -->"
echo "## Docs Generation Benchmark Results"
echo ""
if [ -n "${BASELINE_TIMESTAMP:-}" ]; then
  echo "Comparing PR branch against latest nightly baseline on \`main\` (${BASELINE_TIMESTAMP})."
else
  echo "Comparing PR branch against \`main\` baseline."
fi
echo ""
echo "| Fixture | main | PR | Delta |"
echo "|---------|------|----|-------|"

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
      MAIN_DISPLAY="${BASELINE_VAL}s"
    else
      MAIN_DISPLAY="N/A"
    fi

    PR_DISPLAY="${PR_DURATION}s"
    if [ "$PR_EXIT" != "0" ] && [ "$PR_EXIT" != "null" ]; then
      PR_DISPLAY="${PR_DURATION}s (exit ${PR_EXIT})"
    fi

    echo "| docs | ${MAIN_DISPLAY} | ${PR_DISPLAY} | ${DELTA} |"
  done < "$PR_FILE"
done

echo ""
echo "_Docs generation runs \`fern generate --docs --preview\` end-to-end against the benchmark fixture (includes markdown processing, OpenAPI-to-IR conversion, and FDR upload)._"
echo "_Delta is computed against the nightly baseline on \`main\`._"
if [ -n "${BASELINE_TIMESTAMP:-}" ]; then
  echo "_Baseline from nightly run on \`main\` (${BASELINE_TIMESTAMP}). Trigger [benchmark-baseline](../actions/workflows/benchmark-baseline.yml) to refresh._"
fi
echo "_Last updated: $(date -u '+%Y-%m-%d %H:%M') UTC_"
