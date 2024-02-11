#!/usr/bin/env bash

declare -A COMMANDS
COMMANDS["fern-go-model"]=$(find ./internal/testdata/model -maxdepth 1 -mindepth 1 -type d)
COMMANDS["fern-go-sdk"]=$(find ./internal/testdata/sdk -maxdepth 1 -mindepth 1 -type d)
COMMANDS["fern-go-fiber"]=$(find ./internal/testdata/fiber -maxdepth 1 -mindepth 1 -type d)

for command in "${!COMMANDS[@]}"; do
  directories="${COMMANDS[$command]}"
  for dir in $directories; do
    echo "$dir"

    pushd $dir > /dev/null
    if ! $command config.json; then
      # The command failed, so we leave the fixtures unchanged,
      # and stop early.
      rm -rf tmp
      popd > /dev/null
      break
    else
      rm -rf fixtures
      mv tmp fixtures
    fi
    popd > /dev/null
  done
done
