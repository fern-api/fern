#!/usr/bin/env bash
# Formats benchmark results into a markdown PR comment.
# Usage: format-benchmark-report.sh <pr-results-dir> <main-results-dir>
#
# Each directory contains .jsonl files with one JSON object per line:
#   {"generator":"ts-sdk","spec":"square","duration_seconds":45}

set -euo pipefail

PR_DIR="${1:?Usage: format-benchmark-report.sh <pr-results-dir> <main-results-dir>}"
MAIN_DIR="${2:?Usage: format-benchmark-report.sh <pr-results-dir> <main-results-dir>}"

echo "## SDK Generation Benchmark Results"
echo ""
echo "Comparing PR branch against \`main\` (same runner, apples-to-apples)."
echo ""
echo "<details>"
echo "<summary>Full benchmark table (click to expand)</summary>"
echo ""
echo "| Generator | Spec | main | PR | Delta |"
echo "|-----------|------|------|----|-------|"

# Collect all results from the PR directory
for PR_FILE in "${PR_DIR}"/*.jsonl; do
  [ -f "$PR_FILE" ] || continue

  while IFS= read -r LINE; do
    GENERATOR=$(echo "$LINE" | jq -r '.generator')
    SPEC=$(echo "$LINE" | jq -r '.spec')
    PR_DURATION=$(echo "$LINE" | jq -r '.duration_seconds')
    PR_EXIT=$(echo "$LINE" | jq -r '.exit_code // 0')

    # Look up corresponding main result
    MAIN_FILE="${MAIN_DIR}/${GENERATOR}.jsonl"
    MAIN_DURATION="N/A"
    DELTA="N/A"

    if [ -f "$MAIN_FILE" ]; then
      MAIN_LINE=$(grep "\"spec\":\"${SPEC}\"" "$MAIN_FILE" 2>/dev/null || true)
      if [ -n "$MAIN_LINE" ]; then
        MAIN_DURATION=$(echo "$MAIN_LINE" | jq -r '.duration_seconds')
        if [ "$MAIN_DURATION" != "0" ] && [ "$MAIN_DURATION" != "N/A" ]; then
          DIFF=$(( PR_DURATION - MAIN_DURATION ))
          if [ "$MAIN_DURATION" -gt 0 ]; then
            PCT=$(awk "BEGIN {printf \"%.1f\", ($DIFF / $MAIN_DURATION) * 100}")
            if [ "$DIFF" -ge 0 ]; then
              DELTA="+${DIFF}s (+${PCT}%)"
            else
              DELTA="${DIFF}s (${PCT}%)"
            fi
          fi
          MAIN_DURATION="${MAIN_DURATION}s"
        fi
      fi
    fi

    # Check if this spec was skipped (fetch failure)
    PR_SKIPPED=$(echo "$LINE" | jq -r '.skipped // false')
    if [ "$PR_SKIPPED" = "true" ]; then
      echo "| ${GENERATOR} | ${SPEC} | — | ⏭️ skipped | — |"
      continue
    fi

    PR_DISPLAY="${PR_DURATION}s"
    if [ "$PR_EXIT" != "0" ] && [ "$PR_EXIT" != "null" ]; then
      PR_DISPLAY="${PR_DURATION}s ⚠️"
    fi

    echo "| ${GENERATOR} | ${SPEC} | ${MAIN_DURATION} | ${PR_DISPLAY} | ${DELTA} |"
  done < "$PR_FILE"
done

echo ""
echo "</details>"
echo ""
echo "_Timings include Docker startup, IR parsing, generation, and build scripts. Variance of ±10% is normal._"
echo "_⚠️ = generation exited with a non-zero exit code (timing may not reflect a successful run)._"
