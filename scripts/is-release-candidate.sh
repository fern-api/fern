#!/usr/bin/env bash

set -e

if [[ -z "$1" ]]; then
	exit 1
fi

[[ "$1" =~ ^^([0-9]+)\.([0-9]+)\.([0-9]+)-rc([0-9]+)$ ]]