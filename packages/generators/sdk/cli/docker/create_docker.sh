#!/usr/bin/env bash

set -e

TAG="$1"
DOCKER_NAME=fernapi/fern-typescript-sdk:"$TAG"

DOCKER_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )" &> /dev/null && pwd 2> /dev/null; )";
ROOT_DIR="$DOCKER_DIR/../../../../.."
WEBPACK_CONFIG="$DOCKER_DIR/webpack.config.cjs"
WEBPACK_TS_CONFIG="$DOCKER_DIR/tsconfig.webpack.json"

yarn run compile

webpack_mode="production"
if [[ "$TAG" == "local" ]]; then
	webpack_mode="development"
fi

export GENERATOR_VERSION="$TAG"
yarn node $(yarn bin webpack) --config "$WEBPACK_CONFIG" --mode "$webpack_mode"

docker build -f "$DOCKER_DIR/Dockerfile" -t "$DOCKER_NAME" "$ROOT_DIR"

echo
echo "Built docker: $DOCKER_NAME"
echo "To run image: docker run $DOCKER_NAME"
echo