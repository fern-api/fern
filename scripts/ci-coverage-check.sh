#!/bin/bash
set -e

cd generators/base
COVERAGE=$(npx vitest run --coverage | grep 'All files' | awk '{print $4}' | tr -d '|')
COVERAGE_NUM=$(echo $COVERAGE | sed 's/%//')
echo "Coverage: $COVERAGE_NUM%"
if [ "$(echo "$COVERAGE_NUM < 20" | bc)" -eq 1 ]; then
  echo "Coverage is below threshold!"
  exit 1
fi 