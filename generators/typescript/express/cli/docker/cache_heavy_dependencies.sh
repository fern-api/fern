#!/usr/bin/env sh

set -e

project_name=heavy_deps_project

npm install -g pnpm@10.20.0 --force
npm install -g yarn@1.22.22 --force
pnpm install -g prettier@3.4.2
pnpm install -g @biomejs/biome@2.3.1
pnpm install -g oxlint@0.15.2

mkdir $project_name
cd $project_name

echo '{
  "name": "cache-warmer",
  "version": "1.0.0",
  "devDependencies": {
    "@types/express": "4.17.16",
    "@types/node": "17.0.33",
    "@types/url-join": "4.0.1",
    "axios": "0.27.2",
    "esbuild": "0.16.15",
    "express": "4.18.2",
    "@biomejs/biome": "2.3.1",
    "prettier": "3.4.2",
    "oxlint": "0.15.2",
    "typescript": "5.7.2",
    "url-join": "4.0.1"
  }
}' > package.json

yarn install --ignore-scripts

rm -rf node_modules
rm -rf yarn.lock

pnpm install

cd ..
rm -rf $project_name
