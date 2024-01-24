#!/usr/bin/env bash

set -e

TAG="$1"
DOCKER_NAME=fern-postman:"$TAG"

PACKAGE_DIR="$(pwd)"
DOCKER_DIR="$PACKAGE_DIR/docker"
ROOT_DIR="$DOCKER_DIR/.."
WEBPACK_CONFIG="$DOCKER_DIR/webpack.config.cjs"
WEBPACK_TS_CONFIG="tsconfig.webpack.json"

webpack_mode="production"
if [[ "$TAG" == "local" ]]; then
	webpack_mode="development"
fi

yarn
yarn node $(yarn bin webpack) --config "$WEBPACK_CONFIG" --mode "$webpack_mode"
docker build -f "$DOCKER_DIR/Dockerfile" -t "$DOCKER_NAME" "$ROOT_DIR"

echo
echo "Built docker: $DOCKER_NAME"
echo "To run image: docker run $DOCKER_NAME"
echo