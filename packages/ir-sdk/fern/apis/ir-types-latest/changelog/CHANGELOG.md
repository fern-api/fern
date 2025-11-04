# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v61.8.0] - 2025-11-04

- Feature: Add file upload examples support to ExampleRequestBody with fileUpload variant

## [v61.7.0] - 2025-10-31

- Feature: Add GenerationMetadata to IR

## [v61.6.0] - 2025-10-31

- Chore: BOO 🎃
- Feature: Update union example to include properties from extended types and base properties.

## [v61.4.0] - 2025-10-14

- Feature: Add `CratesPublishTarget` for Rust crates.io publishing support

## [v61.3.0] - 2025-10-10

- Feature: Add exampleStyle property to ReadmeConfig to control README usage example verbosity (minimal vs comprehensive)

## [v61.2.0] - 2025-10-10

- Feature: Add properties from `extra-properties` (aka `additionalProperties`) to inlined request body examples.

## [v61.1.0] - 2025-10-09

- Feature: Add properties from `extra-properties` (aka `additionalProperties`) to object examples.
## [v61.0.0] - 2025-10-02

- Feature: Change `Response` type in dynamic IR to support other response types (streaming, stream parameter, file download, text, bytes)

## [v60.5.0] - 2025-09-24

- Feature: Add `variable` field to `NamedParameter` in dynamic IR to track which parameters reference client-level variables

## [v60.4.0] - 2025-09-24

- Feature: Add variables support to Dynamic IR for client-level variable configuration in SDK snippet generation

## [v60.3.1] - 2025-09-23

- Fix: Pushing new version to fix ir migrations for java and python

## [v60.3.0] - 2025-09-23

- Feature: added mode to ir.GithubPublish to support pull-request mode for selfhosted sdk generation.

## [v60.2.0] - 2025-09-19

- Feature: Add `security` property to `HttpEndpoint` which mirrors OpenAPI's security requirement object.

## [v60.1.0] - 2025-09-18

- Feature: added `x-fern-retries` OpenAPI extension flag 

## [v60.0.1] - 2025-09-15

- Chore: Bump version to 60.0.1 to trigger a release

## [v60.0.0] - 2025-09-15

- Feature: Add type reference to property paths

## [v59.7.0] - 2025-09-12

- Add customSections property to ReadmeConfig

## [v59.6.1] - 2025-09-11

- Fix: Allow optional properties in Dynamic IR SDK

## [v59.6.0] - 2025-09-05

- Feature: Add propertyAccess to named parameters in Dynamic IR

## [v59.5.0] - 2025-09-05

- Feature: Add propertyAccess to object property examples

## [v59.4.0] - 2025-08-26

- Fix: Pushing new version to fix ir migrations for java and python

## [v59.3.0] - 2025-08-26

- Fix: Change readmeConfig.disabledSections type from set to list.

## [v59.2.0] - 2025-08-26

- Feature: Add support for ReadmeConfig.whiteLabel.

## [v59.1.0] - 2025-08-25

- Feature: Add support for readme config for API Name and disabled features list.

## [v59.0.0] - 2025-08-07

- Feature: Add support for inferred auth

## [v58.3.0] - 2024-05-29

- Feature: Add support for publish targets in local file system (when generating the full project).

## [v58.2.0] - 2025-05-29

- Feature: Add support for named code samples in HTTP endpoints.

## [v58.1.0] - 2025-05-22

- Feature: Add support for github mode but disabling actual push of the contents.

## [v58.0.0] - 2025-05-22

- Feature: Add support for `HEAD` method.

## [v57.15.0] - 2025-05-05

- Feature: Enable stream HTTP examples.

## [v57.14.0] - 2025-05-05

- Feature: Enable v2Examples for HttpRequestBodyReference.

## [v57.13.0] - 2025-05-05

- Feature: Add v2Examples and displayName property for Errors.

## [v57.12.0] - 2025-05-04

- Feature: Add a top level selfHosted attribute to the IR.

## [v57.11.0] - 2025-05-01

- Feature: Add support for GitHub publishing configuration in the IR, for self-hosted.

## [v57.10.0] - 2025-04-23

- Fix: `examples.yml` cannot have any recursive reference to `http.yml` in fern otherwise the Python SDK will not build.

## [v57.8.0] - 2025-04-23

- Feature: Add content type to file upload endpoints (multipart/form-data).

## [v57.7.0] - 2025-04-14

- Feature: Align Request v2Example shape with FDR shape.

## [v57.6.0] - 2025-04-14

- Feature: Add support for requestBody and response examples.

## [v57.5.0] - 2025-04-04

- Feature: Update support for property–, schema–, and parameter-level examples.

## [v57.4.0] - 2025-04-04

- Feature: Support property–, schema–, and parameter-level examples.

## [v57.3.0] - 2025-04-04

- Feature: HTTP and Websocket endpoints now support storing lightweight examples.

## [v57.2.0] - 2025-04-01

- Feature: HTTP Endpoints now support storing dynamic snippet requests as examples. (In the future, this will be the only path.)

## [v57.1.0] - 2025-03-05

- Feature: File properties can now support descriptions.

## [v57.0.0] - 2025-03-03

- Feature: The IR now supports the full generator-exec config.
- Feature: The Dynamic IR now supports the generator config, OAuth, additional properties, and root path parameters.

## [v56.0.0] - 2025-02-28

- Feature: Add custom pagination schema

## [v55.4.0] - 2025-02-26

- Feature: ObjectProperty declarations now contain an optional `propertyAccess` field (i.e. for `readOnly` or `writeOnly` properties).

## [v55.3.0] - 2025-02-19

- Feature: The Dynamic IR now supports optional list of examples in each endpoint.

## [v55.2.0] - 2025-02-18

- Feature: Add support for configuring a websocket channel URL.

## [v55.1.0] - 2025-02-18

- Feature: Support form encoding in multipart requests.

## [v55.0.0] - 2025-01-13

- Feature: The IR now supports `nullable<T>` types to distinguish if a property should support explicit `null` values.

## [v54.1.0] - 2025-01-10

- Feature: OAuthAccessTokenRequestProperties now pulls in additional request properties from the OAuth
  getToken endpoint to support custom OAuth schemas.

## [v54.0.0] - 2024-12-11

- Break: The HttpResponse type in the IR now supports bytes responses. This is useful for different languages -
  for example TypeScript can return an `ArrayBuffer` instead of `stream.Readable` in this case.

## [v53.24.0] - 2024-11-04

- Feature: The dynamic snippets IR supports a configurable baseURL and/or environment.

## [v53.23.0] - 2024-11-04

- Internal: Update the Dynamic IR discriminator so that the generated types are unaffected
  when `noSerdeLayer` is enabled.

## [v53.22.0] - 2024-11-04

- Redacted: Use v53.23.0 instead.
- Internal: Add the `dynamic` property to the IR. This should be
  made required in IRv54.

## [v53.21.0] - 2024-11-04

- Internal: Add the `includePathParameters` and `onlyPathParameters` properties to the dynamic
  IR within the `InlinedRequestMetadata` type.

## [v53.20.0] - 2024-11-04

- Internal: Add `includePathParameters` and `onlyPathParameters` property to the wrapped request.

  With this, the generator can determine whether or not the path parameters should be included in
  the wrapped request, or if the wrapped request can be omitted entirely.

## [v53.19.0] - 2024-11-04

- Internal: Add errors property to dynamic `EndpointSnippetResponse`.

## [v53.18.0] - 2024-11-04

- Internal: Add `transport` to `HttpEndpoint`. `transport` on the endpoint overrides the `transport` on the `HttpService`.

## [v53.17.0] - 2024-11-01

- Internal: Add dynamic audience to endpoint snippet request and response.

## [v53.16.0] - 2024-10-31

- Internal: Publish @fern-api/dynamic-ir-sdk

## [v53.15.0] - 2024-10-23

- Internal: Introduce dynamic IR types.

## [v53.14.0] - 2024-10-16

- Feature: Add `inline` to type declarations so that generators can nest unnamed types.

## [v53.13.0] - 2024-10-07

- Feature: Add `contentType` to file upload body properties.

## [v53.12.0] - 2024-09-13

- Feature: Add `contentType` to file upload body properties.

## [v53.11.0] - 2024-09-13

- Fix: Add `availability` to inline websocket, webhook, and http body parameter properties.

## [v53.10.0] - 2024-09-12

- Feature: Add `display-name` to discriminated union values for use with displaying docs.

## [v53.9.0] - 2024-08-29 (TODO: Make required in next major)

- Feature: Introduce a `PublishingConfig` to the IR instead of trying to go through Fiddle.

## [v53.8.0] - 2024-08-23 (TODO: Make required in next major)

- Fix: Include the raw datetime alongside the parsed datetime in `ExamplePrimitive`.

## [v53.7.2] - 2024-08-12

- Fix: Upgrade the Pydantic generator so that `enum_type` is set to `python_enums`

## [v53.7.1] - 2024-08-12

- Fix: Upgrade the Pydantic generator so that `unknown` properties that are missing do not throw.

## [v53.7.0] - 2024-08-12

- Improvement: The IR now contains a `shape` field on the `ExampleQueryParameter` type that denotes whether the parameter
  allows multiple values, and if so, whether they should be comma-separated or exploded.

## [v53.6.0] - 2024-08-05

- Internal: Bump to the latest typescript SDK generator.

## [v53.5.0] - 2024-08-05 \*\* (TODO: Make required in next major)

- Feature: Support a `hasNextPage` property for offset pagination.

## [v53.4.0] - 2024-08-05 \*\* (TODO: Make required in next major)

- Feature: Add `User-Agent` header so that SDK generators can start sending the user agent.

## [v53.3.0] - 2024-08-05

- Feature: Add gRPC/Protobuf types (defined in `proto.yml`) to generate gRPC/Protobuf mappers.

## [v53.2.0] - 2024-07-30

- Improvement: The IR now contains an `extendedProperties` field where all properties from extended types are denormalized. This removes logic
  that generator authors were consistently reimplementing.

## [v53.1.0] - 2024-07-30

- Improvement: The IR now contains the API Definition ID such that the generators may specify this ID when uploading snippet templates. This is necessary for resolving union snippets.

## [v53.0.0] - 2024-07-30

- Feature: Add `float` and `bytes` primitive types.
- Feature: Add a `PrimitiveTypeV2` variant for every `PrimitiveTypeV1`.

## [v52.0.0] - 2024-07-23

- Feature: Add `uint` and `uint64` primitive types.
- Feature: Add support for default enum values.
- Feature: Add support for in-lined type references (e.g. enums).

## [v51.0.0] - 2024-07-18

- Improvement: Add `TypeReference`s to `ExampleContainer` types, especially helpful in the case of empty container
  examples.
- Improvement: The `TypeDeclaration` type now has `userDefinedExamples` in place of the previous `example` field. It
  also now has an `autogeneratedExamples` field that will be populated with autogenerated examples in a future PR.

## [v50.2.0] - 2024-07-16

- Feature: Add `ApiVersionScheme`, which is used to model API version headers as an top-level enum.

## [v50.1.0] - 2024-07-16

- No changes.

## [v50.0.0] - 2024-06-20

- Improvement: add PrimitiveType V2 for Boolean, Long and Big Int types, allowing for default values to be specified

## [v49.0.0] - 2024-06-20

- Feature: Support generating code with `stream` param for endpoints like chat completion.

## [v48.1.0] - 2024-06-20

- Feature: Add an optional `introduction` field to the `ReadmeConfig`, which is configurable
  in the user's `generators.yml`.

## [v48.0.0] - 2024-06-17

- Fix: The unique webhook id is now required.
- Improvement: Pagination endpoints now support request body properties.
- Improvement: Offset pagination now supports a configurable `step` size request property, which
  is useful for offset values that represent the element's global index (e.g. the 500th element),
  rather than the page number (e.g the 5th page).

## [v47.1.0] - 2024-06-09

- Fix: Introduce a unique id for all generated webhooks. This is being added as optional but should
  be made required in v48.

## [v47.0.0] - 2024-06-09

- Feature: Introduce `autogeneratedExamples` and `userProvidedExamples` fields on the HTTPEndpoint. In the
  `userProvidedExample` its now possible for the user to only provide code samples and no structured
  example with input and output.

  Generators should opt to use the code sample provided from the user if that is the case.

## [v46.2.0] - 2024-06-09

- Feature: Add support for webhook examples.

## [v46.1.1] - 2024-06-09

- Fix: Generate the Python SDK for IR using just pydantic v1

## [v46] - 2024-06-04

- Feature: Add support for README.md configuration.

## [v45] - 2024-05-15

- Feature: Support `bigint` primitive types.
- Feature: Add support for default values and validation rules.

## [v44] - 2024-05-10

- Improvement: Support stream and server-sent event response examples.

## [v43] - 2024-05-08

- Improvement: Support custom status codes for success respones.

## [v42] - 2024-05-07

- Improvement: Update OAuth customizability (e.g. configurable `clientId` property).

## [v41] - 2024-05-07

- Feature: Add error examples.

## [v40] - 2024-04-23

- Feature: Add support for extra properties on objects and in-lined requests.

## [v39] - 2024-04-19

- Feature: Add support for OAuth client credentials flow.

## [v38] - 2024-04-17

- Feature: Add support for Server-Sent-Events to Streaming HTTP Responses
  Read more about SSE here: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events.
