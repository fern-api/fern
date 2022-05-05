#!/usr/bin/env bash

set -e

TAG="$1"
DOCKER_NAME=fern-typescript:"$TAG"

PACKAGE_DIR="$(pwd)"
DOCKER_DIR="$PACKAGE_DIR/docker"
WEBPACK_CONFIG="$DOCKER_DIR/webpack.config.js"

yarn
yarn workspaces foreach --all --verbose --parallel --topological run compile
yarn webpack --config "$WEBPACK_CONFIG"
docker build -f Dockerfile -t "$DOCKER_NAME" "$DOCKER_DIR"

echo
echo "Built docker: $DOCKER_NAME"
echo "To run image: docker run $DOCKER_NAME"
echo