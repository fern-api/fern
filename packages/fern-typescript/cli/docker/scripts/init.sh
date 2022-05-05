#!/usr/bin/env sh

set -e 

# install newer version of npm to silence warnings
npm install -g npm@8.9.0

# generate monorepo
node --experimental-modules /scripts/unzipPackages.mjs
node --experimental-modules /scripts/writePackageJson.mjs
cd /fern
rm -r artifacts
yarn