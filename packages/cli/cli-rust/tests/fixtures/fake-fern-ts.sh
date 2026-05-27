#!/usr/bin/env bash
# Stand-in for the bun-compiled cli-v2 binary, used by the dispatcher's
# integration tests. It does two things:
#
#   1. Echoes its argv on stdout, one entry per line, so tests can assert
#      that the dispatcher forwarded the user's arguments unchanged.
#   2. Honors a magic `__exit_with__ N` invocation so we can verify that
#      the parent dispatcher propagates the child's exit code.
#
# Keep this file POSIX-ish so it works under bash on macOS, Linux, and
# Git Bash on Windows.

set -u

i=0
for arg in "$0" "$@"; do
  printf 'argv[%d]=%s\n' "$i" "$arg"
  i=$((i + 1))
done

if [ "${1:-}" = "__exit_with__" ]; then
  exit "${2:-0}"
fi

exit 0
