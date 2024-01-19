#!/usr/bin/env bash

set -e

TAG="$1"
DOCKER_NAME=fernapi/fern-ruby-model:"$TAG"
echo Creating image: "$DOCKER_NAME"
DOCKER_DIR="$( dirname -- "$( readlink -f -- "$0"; )"; )";
echo DOCKER_DIR: "$DOCKER_DIR"
ROOT_DIR="$DOCKER_DIR/../../../../.."
WEBPACK_CONFIG="$DOCKER_DIR/webpack.config.cjs"
yarn run compile
webpack_mode="production"
if [[ "$TAG" == "local" ]]; then
	webpack_mode="development"
fi
export GENERATOR_VERSION="$TAG"
yarn node $(yarn bin webpack) --config "$WEBPACK_CONFIG" --mode "$webpack_mode"
docker build -f "$DOCKER_DIR/Dockerfile.ruby-model" -t "$DOCKER_NAME" "$ROOT_DIR"
echo
echo "Built docker: $DOCKER_NAME"
echo "To run image: docker run $DOCKER_NAME"
echo