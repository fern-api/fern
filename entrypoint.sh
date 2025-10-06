#!/bin/bash

set -e

# This script runs as root initially
if [ "$(id -u)" -eq 0 ]; then
    echo "Starting Docker daemon as root..."
    dockerd > /var/log/dockerd.log 2>&1 &
    
    # Wait for Docker to be ready
    echo "Waiting for Docker to be ready..."
    timeout=60
    while ! docker info > /dev/null 2>&1; do
        if [ $timeout -le 0 ]; then
            echo "Docker failed to start"
            exit 1
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    echo "Docker is ready!"
    
    # Now switch to runner user and re-execute this script
    exec su - runner -c "GH_TOKEN='${GH_TOKEN}' RUNNER_LABELS='${RUNNER_LABELS}' RUNNER_NAME='${RUNNER_NAME}' /home/runner/entrypoint.sh"
fi

# This part runs as the runner user
cd /home/runner

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
    --replace \
    --no-default-labels

# Cleanup function
cleanup() {
    echo "Removing runner..."
    ./config.sh remove --token "${GH_TOKEN}"
}

# Trap exit signals
trap cleanup EXIT

# Start the runner
./run.sh