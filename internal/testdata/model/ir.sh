#!/bin/bash

# Simple script to regenerate ir.json testdata.
for dir in */ ; do
    pushd $dir
    fern ir ir.json
    popd
done
