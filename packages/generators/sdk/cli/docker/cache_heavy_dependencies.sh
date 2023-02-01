#!/usr/bin/env sh

set -e

project_name=heavy_deps_project

mkdir $project_name
cd $project_name

# this exits with a non-zero exit code because git is not installed.
# but it initializes the project correctly.
yarn init -2 || :

yarn add @types/express@4.17.16
yarn add @types/node@17.0.33
yarn add @types/url-join@4.0.1
yarn add axios@0.27.2
yarn add esbuild@0.16.15
yarn add express@4.18.2
yarn add prettier@2.7.1
yarn add tsc-alias@1.7.1
yarn add typescript@4.6.4
yarn add url-join@4.0.1

cd ..
/bin/rm -rf $project_name
