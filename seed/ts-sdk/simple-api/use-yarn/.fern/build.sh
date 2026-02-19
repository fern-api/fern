#!/bin/sh
set -e

corepack enable
corepack prepare yarn --activate
corepack yarn install --frozen-lockfile
corepack yarn build
