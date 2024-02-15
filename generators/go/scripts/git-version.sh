#!/usr/bin/env bash

tag="$(git describe --exact-match --tags HEAD 2> /dev/null || :)"

# if the current commit is tagged but we're not on a tag in Circle, then
# should then ignore the tag
if [[ -n "$tag" && -z "$CIRCLE_TAG" ]]; then
	exclude_param="--exclude $tag"
fi
git describe --tags --always --first-parent $exclude_param
