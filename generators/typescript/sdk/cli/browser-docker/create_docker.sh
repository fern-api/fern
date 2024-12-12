#!/usr/bin/env bash

set -e

TAG="$1"
DOCKER_NAME=fernapi/fern-typescript-browser-sdk:"$TAG"

DOCKER_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]:-$0}")" &>/dev/null && pwd 2>/dev/null)"
ROOT_DIR="$DOCKER_DIR/../../../../.."

export GENERATOR_VERSION="$TAG"

pnpm install
pnpm compile
pnpm build:browser
rm -rf "$DOCKER_DIR/dist"
mv "$DOCKER_DIR/../dist" "$DOCKER_DIR/dist"

is_not_rc=true
if [[ $TAG == *"-rc"* ]]; then
  is_not_rc=false
fi

docker build -f "$DOCKER_DIR/Dockerfile" -t "$DOCKER_NAME" ${is_not_rc:+-t "fernapi/fern-typescript-browser-sdk:latest"} "$ROOT_DIR" --label "version=$TAG"

echo
echo "Built docker: $DOCKER_NAME"
echo "To run image: docker run $DOCKER_NAME"
echo
