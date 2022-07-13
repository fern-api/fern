#!/usr/bin/env bash

commit_tag="$(git describe --exact-match --tags HEAD 2> /dev/null || :)"
head_tag="$(git describe --exact-match HEAD 2> /dev/null || :)"

# if the current commit is tagged but HEAD doesn't point to that tag, then
# should then ignore the tag
[[ -n "$commit_tag" && -z "$head_tag" ]] \
	&& git describe --tags --always --first-parent --exclude "$commit_tag" \
	|| git describe --tags --always --first-parent
