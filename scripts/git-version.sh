#!/usr/bin/env sh

# cd to script directory
cd $(cd -P -- "$(dirname -- "$0")" && pwd -P)

git_tag="$(./git-tag.sh)"

# if the current commit is tagged but the build is not tagged (i.e. $CIRCLE_TAG
# is not defined), then this build occurred *before* the tag was created. We
# should then ignore the tag
[[ -n "$git_tag" && -z "$CIRCLE_TAG" ]] \
	&& git describe --tags --always --first-parent --exclude $git_tag \
	|| git describe --tags --always --first-parent
