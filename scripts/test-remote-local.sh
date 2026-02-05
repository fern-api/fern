#!/bin/bash

# Script to run seed test-remote-local for multiple generators
# Results are logged to separate files in a timestamped directory
#
# Usage:
#   ./scripts/test-remote-local.sh                              # Run all generators (published images)
#   ./scripts/test-remote-local.sh --build                      # Run all generators (build from source)
#   ./scripts/test-remote-local.sh --both                       # Run all generators with AND without --build-generator
#   ./scripts/test-remote-local.sh ts-sdk                       # Run only ts-sdk (published images)
#   ./scripts/test-remote-local.sh --build ts-sdk               # Run only ts-sdk (build from source)
#   ./scripts/test-remote-local.sh --both ts-sdk                # Run ts-sdk with AND without --build-generator
#   ./scripts/test-remote-local.sh --both ts-sdk java-sdk       # Run ts-sdk and java-sdk both ways

BUILD_FLAG=""
RUN_BOTH=false
GENERATORS=()

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --build)
            BUILD_FLAG="--build-generator"
            shift
            ;;
        --both)
            RUN_BOTH=true
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
if [ "$RUN_BOTH" = true ]; then
    echo "Mode: Running both with and without --build-generator"
else
    echo "Build from source: ${BUILD_FLAG:-no}"
fi
echo ""

echo "Building seed..."
pnpm seed:build

echo "Generators to test: ${GENERATORS[*]}"
echo ""

run_test() {
    local generator=$1
    local build_flag=$2
    local suffix=$3

    echo "Running test-remote-local for ${generator} ${suffix}..."
    pnpm seed test-remote-local --generator "$generator" $build_flag 2>&1 | tee "${LOG_DIR}/${generator}${suffix}.log"
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 0 ]; then
        echo "  ✓ ${generator} ${suffix} completed successfully"
    else
        echo "  ✗ ${generator} ${suffix} failed with exit code ${EXIT_CODE}"
    fi
}

for generator in "${GENERATORS[@]}"; do
    if [ "$RUN_BOTH" = true ]; then
        # Run without --build-generator first
        run_test "$generator" "" "(published)"
        # Then run with --build-generator
        run_test "$generator" "--build-generator" "(built)"
    else
        # Run with the specified flag (or no flag)
        run_test "$generator" "$BUILD_FLAG" ""
    fi
done

echo ""
echo "All runs completed at $(date)"
echo "Logs saved to: $LOG_DIR"
