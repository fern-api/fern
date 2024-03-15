#!/usr/bin/env bash

set -e

TAG="$1"
DOCKER_NAME=fernapi/fern-typescript-browser-sdk:"$TAG"

DOCKER_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]:-$0}")" &>/dev/null && pwd 2>/dev/null)"
ROOT_DIR="$DOCKER_DIR/../../../../.."

export GENERATOR_VERSION="$TAG"

yarn build:browser
rm -rf "$DOCKER_DIR/dist"
mv "$DOCKER_DIR/../dist" "$DOCKER_DIR/dist"

docker build -f "$DOCKER_DIR/Dockerfile" -t "$DOCKER_NAME" "$ROOT_DIR"

echo
echo "Built docker: $DOCKER_NAME"
echo "To run image: docker run $DOCKER_NAME"
echo
