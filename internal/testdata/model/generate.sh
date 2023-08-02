#!/bin/bash

# Simple script to regenerate fixture testdata.
for dir in */ ; do
    if [ "$(basename $dir)" == "github" ]; then
      # The github testdata is configured with
      # a non-local generator configuration,
      # so we need to skip it here.
      #
      # If you ever need to update these fixtures,
      # use the fern-go-binary instead.
      continue
    fi

    pushd $dir
    fern-go-model config.json
    popd
done
