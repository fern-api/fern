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
prettier@2.7.1 \
typescript@4.6.4 \
url-join@4.0.1 \
@ungap/url-search-params@0.2.2

cd ..
/bin/rm -rf $project_name
