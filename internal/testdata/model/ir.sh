#!/bin/bash

# Simple script to regenerate ir.json testdata.
for dir in */ ; do
    pushd $dir
    fern upgrade
    fern ir ir.json
    popd
done
