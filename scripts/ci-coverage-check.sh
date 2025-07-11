#!/bin/bash
set -e

cd generators/base

# Run coverage and capture output
COVERAGE_OUTPUT=$(npx vitest run --coverage)

# Print the full coverage output to stdout (for CI logs)
echo "$COVERAGE_OUTPUT"

# Extract the coverage percentage from the output
COVERAGE=$(echo "$COVERAGE_OUTPUT" | grep 'All files' | awk '{print $4}' | tr -d '|')
COVERAGE_NUM=$(echo $COVERAGE | sed 's/%//')
echo "Coverage: $COVERAGE_NUM%"

# Warn if below threshold, but never fail
if [ "$(echo "$COVERAGE_NUM < 20" | bc)" -eq 1 ]; then
  echo "WARNING: Coverage is below threshold!"
fi

exit 0 