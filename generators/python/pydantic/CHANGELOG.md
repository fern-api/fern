# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

- Improvement: Remove support for Python 3.7. In order to support newer versions of libraries we depend on (such as typing and typing-extensions), we must move on to Python 3.8. With this change we are also able to:
  - Remove the `backports` dependency, as `cached_property` is now included within `functools`
  - Remove the upper bound dependency on Pydantic which had dropped support for Python 3.7

## [0.8.1-rc0] - 2024-01-29

- Fix: Increase recursion depth to allow for highly nested and complex examples,
  this is a temporary solution while the example datamodel is further refined.

## [0.8.0-rc0] - 2024-01-28

- Fix: better handles cyclical references. In particular,
  cyclical references are tracked for undiscriminated unions,
  and update_forward_refs is always called with object references.

## [0.7.7] - 2024-01-21

- Chore: Intialize this changelog
