#!/usr/bin/env bash
# Used by the dispatcher tests as a "this should never be invoked" guard.
# If a Rust-native command accidentally falls through to fern-ts, this
# script trips the test loudly.
set -u
echo "EXPLODED: fern-ts was invoked by mistake" >&2
echo "EXPLODED"
exit 99
