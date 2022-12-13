#!/usr/bin/env bash

set -e

version="$CIRCLE_TAG"

if [[ -z "$version" ]]; then
	exit 1
fi

[[ "$version" =~ ^^([0-9]+)\.([0-9]+)\.([0-9]+)-rc([0-9]+)$ ]]