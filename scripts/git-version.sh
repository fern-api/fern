#!/usr/bin/env bash

tag="$(git describe --exact-match --tags HEAD 2> /dev/null || :)"

if [[ -n "$CIRCLE_TAG" ]]; then
	echo "$CIRCLE_TAG"
	exit 0
fi

# if we're not on a tag in Circle but the current commit is tagged, then
# should then ignore the tag
if [[ -n "$tag" ]]; then
	exclude_param="--exclude $tag"
fi
git describe --tags --always --first-parent $exclude_param
