#!/bin/bash

# Script to run seed test-remote-local for multiple generators
# Results are logged to separate files in a timestamped directory
#
# Usage:
#   ./scripts/test-remote-local.sh                              # Run all generators (published images)
#   ./scripts/test-remote-local.sh --build                      # Run all generators (build from source)
#   ./scripts/test-remote-local.sh ts-sdk                       # Run only ts-sdk (published images)
#   ./scripts/test-remote-local.sh --build ts-sdk               # Run only ts-sdk (build from source)
#   ./scripts/test-remote-local.sh --build ts-sdk java-sdk      # Run ts-sdk and java-sdk (build from source)

BUILD_FLAG=""
GENERATORS=()

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --build)
            BUILD_FLAG="--build-generator"
            shift
            ;;
        *)
            GENERATORS+=("$1")
            shift
            ;;
    esac
done

ALL_GENERATORS=("ts-sdk" "python-sdk" "go-sdk" "java-sdk")

# Use all generators if none specified
if [ ${#GENERATORS[@]} -eq 0 ]; then
    GENERATORS=("${ALL_GENERATORS[@]}")
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_DIR="test-remote-local-logs-${TIMESTAMP}"

mkdir -p "$LOG_DIR"

echo "Starting test-remote-local runs at $(date)"
echo "Logs will be saved to: $LOG_DIR"
echo "Build from source: ${BUILD_FLAG:-no}"
echo ""

echo "Building seed..."
pnpm seed:build

echo "Generators to test: ${GENERATORS[*]}"
echo ""

for generator in "${GENERATORS[@]}"; do
    echo "Running test-remote-local for ${generator}..."
    pnpm seed test-remote-local --generator "$generator" $BUILD_FLAG 2>&1 | tee "${LOG_DIR}/${generator}.log"
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
