#!/usr/bin/env sh

set -e

project_name=heavy_deps_project

mkdir $project_name
cd $project_name

yarn init --yes

yarn add \
  @types/jest@^29.5.14 \
  @types/node-fetch@^2.6.12 \
  @types/node@^18.19.70 \
  @types/qs@^6.9.17 \
  @types/url-join@4.0.1 \
  form-data@^4.0.0 \
  jest-environment-jsdom@^29.7.0 \
  jest@^29.7.0 \
  js-base64@^3.7.7 \
  node-fetch@^2.7.0 \
  prettier@^3.4.2 \
  qs@^6.13.1 \
  ts-jest@^29.1.1 \
  typescript@~5.7.2 \
  url-join@4.0.1

cd ..
/bin/rm -rf $project_name
