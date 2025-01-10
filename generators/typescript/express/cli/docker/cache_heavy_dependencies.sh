#!/usr/bin/env sh

set -e

project_name=heavy_deps_project

mkdir $project_name
cd $project_name

yarn init --yes

yarn add \
  @types/express@4.17.16 \
  @types/node@17.0.33 \
  @types/url-join@4.0.1 \
  axios@0.27.2 \
  esbuild@0.16.15 \
  express@4.18.2 \
  prettier@3.4.2 \
  typescript@5.7.2 \
  url-join@4.0.1

cd ..
/bin/rm -rf $project_name
