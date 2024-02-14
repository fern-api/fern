# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## Unreleased -->

## [0.10.1] - 2024-02-14

- Improvement: Add support for a RequestOptions object for each generated function within Python SDKs. This parameter is an optional final parameter that allows for configuring timeout, as well as pass in arbitrary data through to the request. RequestOptions is a TypedDict, with optional fields, so there's no need to instantiate an object, just pass in the relevent keys within a dict!

  - `timeout_in_seconds` overrides the timeout for this specific request
  - `additional_body_parameters` are expanded into the JSON request body
  - `additional_query_parameters` are expanded into the JSON query parameters map
  - `additional_headers` are expanded into the request's header map
  - Here's an example:

    ```python
    client\
      .imdb\
      .create_movie(
        request=CreateMovieRequest(title="title", rating=4.3),
        request_options={
          "timeout_in_seconds": 99,
          "additional_body_parameters": {"another": "body parameter"},
          "additional_headers": {"another": "header"},
        }
      )
    ```

## [0.10.0] - 2024-02-13

- Improvement: Remove support for Python 3.7. In order to support newer versions of libraries we depend on (such as typing and typing-extensions), we must move on to Python 3.8. With this change we are also able to:
  - Remove the `backports` dependency, as `cached_property` is now included within `functools`
  - Remove the upper bound dependency on Pydantic which had dropped support for Python 3.7

## [0.9.1] - 2024-02-11

- Fix: Remove literals from SDK function signatures, as they are not modifiable for end users.

  Before:

  ```python
  def get_options(self, *, dry_run: typing_extensions.Literal[True]) -> Options:
    ...
    json=jsonable_encoder({"dryRun": dry_run}),
    ...
  ```

  After:

  ```python
  def get_options(self, *) -> Options:
    ...
    json=jsonable_encoder({"dryRun": "true"}),
  ```

- Fix: Acknowledge the optionality of a `File` property, previously we were requiring all `File` type inputs, even if they were specified as optional within the OpenAPI or Fern definition. Now, we check if the parameter is required and make the parameter optional if it is not.

## [0.9.0] - 2024-02-11

- Feature: The SDK generator now supports whitelabelling. When this is turned on,
  there will be no mention of Fern in the generated code.

  **Note**: You must be on the enterprise tier to enable this mode.

## [0.8.3-rc0] - 2024-01-29

- Fix: Increase recursion depth to allow for highly nested and complex examples,
  this is a temporary solution while the example datamodel is further refined.

## [0.8.2-rc0] - 2024-01-28

- Fix: The Python SDK better handles cyclical references. In particular,
  cyclical references are tracked for undiscriminated unions,
  and update_forward_refs is always called with object references.

## [0.8.1] - 2024-01-26

- Feature: If the auth scheme has environment variables specified,
  the generated python client will scan those environment variables.

  For example, for the following Fern Definition

  ```
  auth: APIKey
  auth-schemes:
    APIKey:
      header: X-FERN-API-KEY
      type: string
      env: FERN_API_KEY
  ```

  the generated client will look like

  ```python
  import os

  class Client:

    def __init__(self, *, apiKey: str = os.getenv("FERN_API_KEY"))
  ```

## [0.8.0] - 2024-01-25

- Fix: Enums in inlined requests send the appropriate value.

  ```python
  class Operand(str, Enum):
    greater_than = ">"
    equal_to = "="

  # Previously the SDK would just send the operand directly
  def endpoint(self, *, operand: Operand):
    httpx.post(json={"operand": operand})

  # Now, the SDK will send the value of the enum
  def endpoint(self, *, operand: Operand):
    httpx.post(json={"operand": operand.value})
  ```

## [0.7.7] - 2024-01-21

- Chore: Intialize this changelog
