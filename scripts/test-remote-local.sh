#!/bin/bash

# Script to run seed test-remote-local for multiple generators
# Results are logged to separate files in a timestamped directory

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_DIR="test-remote-local-logs-${TIMESTAMP}"

mkdir -p "$LOG_DIR"

echo "Starting test-remote-local runs at $(date)"
echo "Logs will be saved to: $LOG_DIR"
echo ""

GENERATORS=("ts-sdk" "python-sdk" "go-sdk" "java-sdk")

for generator in "${GENERATORS[@]}"; do
    echo "Running test-remote-local for ${generator}..."
    pnpm seed:local test-remote-local --generator "$generator" --build-generator 2>&1 | tee "${LOG_DIR}/${generator}.log"
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 0 ]; then
        echo "  ✓ ${generator} completed successfully"
    else
        echo "  ✗ ${generator} failed with exit code ${EXIT_CODE}"
    fi
done

echo ""
echo "All runs completed at $(date)"
echo "Logs saved to: $LOG_DIR"
