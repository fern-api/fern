#!/usr/bin/env bash
tag=$1
set -e

DOCKER_NAME=fern-typescript:"$tag"

PACKAGE_DIR="$(pwd)"
DOCKER_DIR="$PACKAGE_DIR/docker"
MONOREPO_SETUP_DIR="$DOCKER_DIR/monorepo"
ARTIFACTS_DIR="$MONOREPO_SETUP_DIR/artifacts"
MONOREPO_ROOT="$PACKAGE_DIR/../../.."

yarn
yarn workspaces foreach --all --verbose --parallel --topological run compile

rm -rf "$MONOREPO_SETUP_DIR"
mkdir "$MONOREPO_SETUP_DIR"

mkdir "$ARTIFACTS_DIR"
yarn workspaces foreach --all --no-private pack --out "$ARTIFACTS_DIR/%s-%v.tgz"

cd "$MONOREPO_ROOT"
cp -R yarn.lock .yarnrc.yml "$MONOREPO_SETUP_DIR"
mkdir "$MONOREPO_SETUP_DIR/.yarn"
cp -R .yarn/plugins .yarn/releases "$MONOREPO_SETUP_DIR/.yarn"

cd "$DOCKER_DIR"
docker build -f Dockerfile -t "$DOCKER_NAME" "$DOCKER_DIR"

echo
echo "Built docker: $DOCKER_NAME"
echo "To run image: docker run $DOCKER_NAME"
echo