# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.11.5] - 2024-02-23

- Fix: Fix the usage of ApiError when leveraging auth envvars, when the schema for ApiError was changed, this usage was missed in the update.

## [0.11.4] - 2024-02-23

- Fix: We now grab enum values appropriately when enums are within unions.

## [0.11.3] - 2024-02-22

- Fix: Transition from lists to sequences within function calls, this is a fix as a result of how mypy handles type variance.
  This fix is only for function calls as testing shows that we do not hit the same issue within mypy with list[union[*]] fields on pydantic objects.
  This issue outlines it well: https://stackoverflow.com/questions/76138438/incompatible-types-in-assignment-expression-has-type-liststr-variable-has

- Improvement: The Python SDK generator now defaults to `require_optional_fields = False`. This means that any requests that have optional fields no longer require a user to input data (or a `None` value) in.
  Example:

  ```python
  # Previously:
  def my_function(my_parameter: typing.Optional[str]):
    pass

  my_function()  # <--- This fails mypy
  my_function(None)  # <--- This is necessary
  my_function("I work in both cases!")
  ...
  # Now:
  def my_function():
    pass

  my_function()  # <--- I no longer fail mypy
  my_function(None)  # <--- I still work
  my_function("I work in both cases!")
  ```

## [0.11.2] - 2024-02-21

- Improvement (Beta): The Python generator now supports a configuration option called `improved_imports`. To enable
  this configuration, just add the following to your generators.yml

  ```yaml
  generators:
    - name: fernapi/fern-python-sdk
      ...
      config:
        improved_imports: true
  ```

  Enabling improved imports will remove the verbose `resources` directory in the SDK and make the imports
  shorter. This will also improve the imports from Pylance and Pyright that are automaticaly generated

  ```python
  # Before
  from sdk.resources.fhir import Paient

  # After
  from sdk.fhir import Patient
  ```

## [0.11.1] - 2024-02-20

- Improvement: Python now supports specifying files to auto-export from the root `__init__.py` file, this means you can export custom classes and functions from your package for users to access like so:

  ```python
  from my_package import custom_function
  ```

  the configuration for this is:

  ```yaml
  # generators.yml
  python-sdk:
    generators:
      - name: fernapi/fern-python-sdk
        version: 0.11.1
        config:
          additional_init_exports:
            - from: file_with_custom_function
              imports:
                - custom_function
  ```

- Chore: Add a docstring for base clients to explain usage, example:

  ```python
  class SeedTest:
    """
    Use this class to access the different functions within the SDK. You can instantiate any number of clients with different configuration that will propogate to these functions.
    ---
    from seed.client import SeedTest

    client = SeedTest(
        token="YOUR_TOKEN",
        base_url="https://yourhost.com/path/to/api",
    )
    """
  ```

## [0.11.0] - 2024-02-19

- Improvement: Python now supports a wider range of types for file upload, mirroring the `httpx` library used under the hood, these are grouped under a new type `File`:

  ```python
  # core/file.py
  FileContent = typing.Union[typing.IO[bytes], bytes, str]
  File = typing.Union[
      # file (or bytes)
      FileContent,
      # (filename, file (or bytes))
      typing.Tuple[typing.Optional[str], FileContent],
      # (filename, file (or bytes), content_type)
      typing.Tuple[typing.Optional[str], FileContent, typing.Optional[str]],
      # (filename, file (or bytes), content_type, headers)
      typing.Tuple[typing.Optional[str], FileContent, typing.Optional[str], typing.Mapping[str, str]],
  ]

  ...

  # service.py
  def post(
      self,
      *,
      file: core.File,
      request_options: typing.Optional[RequestOptions] = None,
  ) -> None:
      """
      Parameters:
          - file: core.File. See core.File for more documentation
          - request_options: typing.Optional[RequestOptions]. Request-specific configuration.
      """
  ...

  # main.py
  f = open('report.xls', 'rb')
  service.post(file=f)

  # Or leveraging a tuple
  with open('largefile.zip', 'rb') as f:
    service.post(file=('largefile.zip', f))
  ...
  ```

- Fix: Python now supports API specifications that leverage lists for file upload. Previously, Fern incorrectly made all `list<file>` type requests simply `file`.

  ```python
  # service.py
  def post(
      self,
      *,
      file_list: typing.List[core.File],
      request_options: typing.Optional[RequestOptions] = None,
  ) -> None:
      """
      Parameters:
          - file_list: typing.List[core.File]. See core.File for more documentation
          - request_options: typing.Optional[RequestOptions]. Request-specific configuration.
      """
  ...

  # main.py
  f1 = open('report.xls', 'rb')
  f2 = open('page.docx', 'rb')
  service.post(file_list=[f1, f2])
  ```

## [0.10.3] - 2024-02-19

- Fix: Several bugfixes were made to related to literal properties. If a literal is
  used as a query parameeter, header, path parameter, or request parameter, the user
  no longer has to explicitly pass it in.

  For example, the following endpoint

  ```yaml
  endpoints:
    chat_stream:
      request:
        name: ListUsersRequest
        headers:
          X_API_VERSION: literal<"2022-02-02">
        body:
          properties:
            stream: literal<true>
            query: string
  ```

  would generate the following signature in Python

  ```python
  class Client:

    # The user does not have to pass in api version or stream since
    # they are literals and always the same
    def chat_stream(self, *, query: str) -> None:
  ```

## [0.10.2] - 2024-02-18

- Fix: The SDK always sends the enum wire value instead of the name of the enum. For example,
  for the following enum,

  ```python
  class Operand(str, enum.Enum):
    GREATER_THAN = ">"
    EQUAL_TO = "="
  ```

  the SDK should always be sending `>` and `=` when making a request.

  This affected enums used in path parameters, query parameters and any request body parameters at
  the first level. To fix, the SDK sends the `.value` attribute of the enum.

- Fix: Revert #2719 which introduced additional issues with circular references within our Python types.

## [0.10.1] - 2024-02-14

- Improvement: Add support for a RequestOptions object for each generated function within Python SDKs. This parameter is an optional final parameter that allows for configuring timeout, as well as pass in arbitrary data through to the request. RequestOptions is a TypedDict, with optional fields, so there's no need to instantiate an object, just pass in the relevant keys within a dict!

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
