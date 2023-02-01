#!/usr/bin/env sh

set -e

project_name=heavy_deps_project

mkdir $project_name
cd $project_name

# this exits with a non-zero exit code because git is not installed.
# but it initializes the project correctly.
yarn init -2 || :

yarn add typescript@4.6.4

cd ..
/bin/rm -rf $project_name
