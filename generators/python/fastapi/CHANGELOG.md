# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0-rc0] - 2024-07-31

- Internal: The generator now consumes IRv53.

## [1.0.0-rc0] - 2024-07-16

- Break: The generated server stubs now support Pydantic V2 outright, it no longer uses `pydantic.v1` models. This change introduces additional breaks:

  - Wrapped aliases have been removed
  - Custom root validators for models with a **root** type have been removed (e.g. only unions with utils still leverages root models)
  - Public fields previously prefixed with `_` are now prefixed with `f_` (Pydantic V2 does not allow for `_` prefixes on public fields and Python does not allow for a numeric prefix)

- NOTE: This version allows for upgrading your FastAPI version to latest (> 0.111.0), as well as Pydantic V2. If you are leveraging `output: location: local-file-system` you will have to bump these versions yourself!

## [0.11.1] - 2024-07-10

- Fix: The FastAPI generator now respects the `use_str_enums` flag, and defaults it to `False`.

## [0.11.0] - 2024-07-10

- Fix: The FastAPI generator now correctly sanitizes parameter descriptions. Previously it was duplicating strings.

## [0.11.0-rc0] - 2024-06-24

- Upgrade: The generator now consumes IRv49.

## [0.10.1] - 2024-06-19

- Internal: The generator now consumes IRv46.

## [0.10.0] - 2024-06-06

- Feature: The FastAPI generator now accepts the `extra_fields` configuration. You can allow extra fields with the following:

```yaml
- name: fernapi/fern-fastapi-server
  version: 0.10.0
  config:
    pydantic_config:
      extra_fields: allow
```

## [0.9.3] - 2024-05-28

- Fix: pydantic utilities are brought inline with the SDK and model generator

## [0.9.2] - 2024-05-27

- Fix: paths are no longer prefixed with double forward slashes.

## [0.9.1] - 2024-05-09

- No changes.

## [0.9.1-rc0] - 2024-04-22

- Fix: Pydantic utilities are now copied over to the project

## [0.9.0-rc1] - 2024-04-22

- Feature: The generator now depends on v39 of Intermediate Representation which requires the latest
  CLI.

## [0.9.0-rc0]

- Feature: The generator now depends on v38 of Intermediate Representation which requires the latest
  CLI.

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
