#!/bin/bash

# Simple script to regenerate fixture testdata.
for dir in */ ; do
    pushd $dir
    fern generate --local
    popd
done
