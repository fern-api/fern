#!/usr/bin/env bash

set -e

dist_dir=dist
dist_name=fern-api
version="$1"
cli_name=fern
repository=https://github.com/fern-api/fern
bundle=bundle.js

# cd to script directory
cd $(cd -P -- "$(dirname -- "$0")" && pwd -P)

# remove existing dist
/bin/rm -rf "$dist_dir"

yarn run --top-level compile

# webpack
package_version=$(yarn info @fern-api/cli --all --json | jq -r .children.Version)
TS_NODE_PROJECT=tsconfig.webpack.json PACKAGE_VERSION="$package_version" yarn webpack --progress

cd "$dist_dir"

# write package.json
cat > package.json <<EOL
{
  "name": "${dist_name}",
  "version": "${version}",
  "repository": "${repository}",
  "files": [
    "${bundle}"
  ],
  "bin": {
    "${cli_name}": "${bundle}"
  }
}
EOL

# write empty yarn.lock so yarn doesn't try to associate this package with the monorepo
touch yarn.lock

# install package into yarn.lock
# (set enableImmutableInstalls=false so we can modify yarn.lock, even when in CI)
YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn install