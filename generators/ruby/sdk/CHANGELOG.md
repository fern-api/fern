# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## [0.0.2] - 2024-02-01

- Improvement: Consolidate imports into the main file for easier gem usage, as opposed to directly importing the specific file (e.g. `require "fern" vs. require "fern/types/folder_a/object"`)

- Improvement: Added `rubygems` output block to generators.yml. To publish your ruby gem, setup your generators.ym like this:

```yaml
# generators.yml

groups:
 - name: ...
    version: ...
    location:
       output: rubygems
       api-key: ${API_KEY}
       package-name: "petstore"
```

## [0.0.1] - 2024-02-01

- Improvement: Support client generation (async and async) as well as most endpoint types (except streaming)

## [0.0.0] - 2024-01-30

- Chore: Intialize this changelog
