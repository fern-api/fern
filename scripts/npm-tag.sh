#!/usr/bin/env bash

# cd to script directory
cd $(cd -P -- "$(dirname -- "$0")" && pwd -P)

[[ -z "$(./git-tag.sh)" ]] && echo next || echo latest