# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2024-03-22

- Internal: Shared generator notification and config parsing logic.

## [0.1.0] - 2024-02-11
- Fix: The Postman generator no longer times out on the latest CLI version. 
  
  The generator would previously throw on additional fields being present in the IR, which would prevent
  Fern from adding new fields. Now, the generator does not throw if additional fields are present.


## [0.0.46] - 2024-02-09

- Chore: Intialize this changelog