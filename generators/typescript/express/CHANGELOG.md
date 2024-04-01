# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.9-rc0] - 2024-03-22
- Fix: Compile started failing for express generators with the following error: 

  ```
  error TS2688: Cannot find type definition file for 'mime'.

  The file is in the program because:
    Entry point for implicit type library 'mime'
  ```

  The root cause is because a breaking change was released in v4 of the mime library. 
  This is now fixed because the generator resolves to v3 of the library as 
  specified in this GitHub [issue](https://github.com/firebase/firebase-admin-node/issues/2512). 

## [0.9.8] - 2024-03-22
- Improvement: Enhance serde performance by reducing reliance on async behavior and lazy async dynamic imports.
- Internal: Shared generator notification and config parsing logic.

## [0.9.7] - 2024-02-11

- Chore: Intialize this changelog
