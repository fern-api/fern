# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

- Fix: Previously `core.Stream` would not work in the Browser. Now the generated Fern SDK 
  includes a polyfill for `ReadableStream` and uses `TextDecoder` instead of `Buffer`. 

- Feature: add in a reference markdown file, this shows a quick outline of the available endpoints, 
  it's documentation, code snippet, and parameters.

  This feature is currently behind a feature flag called `includeApiReference` and can be used 
  ```yaml
  config: 
    includeApiReference: true
  ```

## [0.11.4] - 2024-02-15

- Fix: The `Fetcher` now supports sending binary as a request body. This is important
  for APIs that intake `application/octet-stream` content types or for folks that have
  .fernignored their and added custom utilities that leverage the fetcher.

## [0.11.3] - 2024-02-13

- Fix: ensure SDK generator always uses `node-fetch` in Node.js environments. There is an experimental
  fetch packaged with newer versions of Node.js, however it causes unexpected behavior with
  file uploads.

## [0.11.2] - 2024-02-13

- Fix: ensure SDK generator does not drop additional parameters from requests that perform file upload. Previously, if an endpoint had `file` inputs without additional `body` parameters, query parameters were eroniously ignored.

## [0.11.1] - 2024-02-13

- Fix: The SDK generator no longer generates a `tsconfig.json` with `noUnusedParameters`
  enabled. This check was too strict.

## [0.11.0] - 2024-02-13

- Feature: The SDK generator now forwards information about the runtime that it is being
  used in. The header `X-Fern-Runtime` will report the runtime (e.g. `browser`, `node`, `deno`)
  and the header `X-Fern-Runtime-Version` will report the version.

## [0.10.0] - 2024-02-11

- Feature: The SDK generator now supports whitelabelling. When this is turned on,
  there will be no mention of Fern in the generated code.

  **Note**: You must be on the enterprise tier to enable this mode.

## [0.9.7] - 2024-02-11

- Chore: Intialize this changelog
