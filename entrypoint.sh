#!/bin/bash

# Required environment variables:
# - GH_TOKEN: Registration token from GitHub
# Optional environment variables:
# - RUNNER_LABELS: Custom labels (default: "docker")
# - RUNNER_NAME: Name for this runner (default: hostname)

set -e

# Set defaults
RUNNER_LABELS="${RUNNER_LABELS:-docker}"
RUNNER_NAME="${RUNNER_NAME:-$(hostname)}"

echo "Configuring runner with labels: $RUNNER_LABELS"

# Configure the runner
./config.sh \
    --url "https://github.com/fern-api" \
    --token "${GH_TOKEN}" \
    --name "${RUNNER_NAME}" \
    --labels "${RUNNER_LABELS}" \
    --work _work \
    --unattended \
    --replace

# Cleanup function
cleanup() {
    echo "Removing runner..."
    ./config.sh remove --token "${GH_TOKEN}"
}

# Trap exit signals
trap cleanup EXIT

# Start the runner
./run.sh