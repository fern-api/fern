#!/bin/bash

# Simple script to regenerate testdata.
# This is temporary - it will be replaced
# by proper, programmatic integration testing.
for dir in */ ; do
    pushd $dir
    fern generate --local
    popd
done
