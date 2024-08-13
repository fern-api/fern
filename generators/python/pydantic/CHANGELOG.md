# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2024-08-13

- Fix: Unions with utils now update forward refs again

## [1.4.0] - 2024-08-06

- Improvement: expose `package_name` configuration option for pydantic models. This field controls the package from which users will import your client, for example, the following config would allow users to use: `from my_custom_package import Client`
  ```yaml
  generators:
    - name: fernapi/fern-pydantic-model
      config:
        package_name: my_custom_package
  ```

## [1.3.1] - 2024-08-05

- Fix: The root type for unions with visitors now has it's parent typed correctly. This allows auto-complete to work once again on the union when it's nested within other pydantic models.

## [1.3.0] - 2024-08-05

- Improvement: The generated models now respects the pydantic version flag, generating V1 only code and V2 only code if specified. If not, the models is generated as it is today, with compatibility for BOTH Pydantic versions. This cleans up the generated code, and brings back features liked wrapped aliases and custom root validators for V1-only models.

  ```yaml
  generators:
    - name: fernapi/fern-pydantic-model
      config:
        pydantic_config:
          version: "v1" # Other valid options include: "v2" and "both"
  ```

## [1.2.0] - 2024-08-04

- Internal: The generator has now been upgraded to use Pydantic V2 internally. Note that
  there is no change to the generated code, however by leveraging Pydantic V2 you should notice
  an improvement in `fern generate` times.

## [1.1.0-rc0] - 2024-07-31

- Internal: The generator now consumes IRv53.

## [1.0.0-rc0] - 2024-07-16

- Break: The generated models now support Pydantic V2 outright, it no longer uses `pydantic.v1` models. This change introduces additional breaks:
  - Wrapped aliases have been removed
  - Custom root validators for models with a **root** type have been removed (e.g. only unions with utils still leverages root models)
  - Public fields previously prefixed with `_` are now prefixed with `f_` (Pydantic V2 does not allow for `_` prefixes on public fields and Python does not allow for a numeric prefix)

## [0.10.0-rc0] - 2024-06-24

- Upgrade: The generator now consumes IRV49.

## [0.9.1] - 2024-06-19

- Internal: The generator now consumes IRv46.

## [0.9.0] - 2024-05-09

- No changes.

## [0.9.0-rc1] - 2024-04-22

- Feature: The generator now depends on v39 of Intermediate Representation which requires the latest
  CLI.

## [0.9.0-rc0] - 2024-01-29

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
