#!/usr/bin/env bash

set -e

dist_name=fern-api
version="$1"
cli_name=fern
repository=https://github.com/fern-api/fern
bundle=bundle.js

# cd to script directory
cd $(cd -P -- "$(dirname -- "$0")" && pwd -P)

# webpack
package_version=$(yarn info @fern-api/cli --all --json | jq -r .children.Version)
TS_NODE_PROJECT=tsconfig.webpack.json PACKAGE_VERSION="$package_version" webpack --progress

# write package.json
cat >dist/package.json <<EOL
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