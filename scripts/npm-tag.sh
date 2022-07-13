#!/usr/bin/env bash

[[ -z "$(git describe --exact-match HEAD 2> /dev/null || :)" ]] && echo next || echo latest