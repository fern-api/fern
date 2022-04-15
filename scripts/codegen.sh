#!/usr/bin/env sh

set -e

yarn workspaces focus @fernapi/api-generation
yarn workspace @fernapi/api-generation run codegen