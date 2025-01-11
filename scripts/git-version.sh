#!/usr/bin/env bash

# if the current commit is tagged, return the tag, otherwise describe with nearest tag
tag="$(git describe --exact-match --tags HEAD 2> /dev/null || :)"
if [[ -n "$tag" ]]; then
    echo "$tag"
else
    git describe --tags --always --first-parent
fi
