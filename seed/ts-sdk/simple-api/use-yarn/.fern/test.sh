#!/bin/sh
set -e

corepack enable
corepack prepare yarn --activate
corepack yarn test
