# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.47.2] - 2025-01-15

- Fix: Record types with `null` values are now correctly serialized.

## [0.47.1] - 2025-01-15

- Fix: Resolves an issue where nullable query parameters were not null-safe in their method invocations. The
  generated code now appropriately guard against `null` values like so:

  ```typescript
  const _queryParams: Record< ... >;
  if (value !== undefined) {
      _queryParams["value"] = value?.toString() ?? null;
  }
  ```

## [0.47.0] - 2025-01-14

- Feature: Add support for `nullable` properties. Users can now specify explicit `null` values
  for types that specify `nullable` properties like so:

  ```typescript
  await client.users.update({ username: "john.doe", metadata: null });
  ```

## [0.46.11] - 2025-01-14

- Fix: Don't double check whether an optional string literal alias (see example below) is a string when using serializer to build query string parameters.

  ```yml
  types:
    LiteralAliasExample: literal<"MyLiteralValue">

  service:
    endpoints:
      foo:
        path: /bar
        method: POST
        request:
          name: FooBarRequest
          query-parameters:
            optional_alias_literal: optional<LiteralAliasExample>
  ```

  ```ts
  // before
  if (optionalAliasLiteral != null) {
      _queryParams["optional_alias_literal"] = typeof serializers.LiteralAliasExample.jsonOrThrow(optionalAliasLiteral, {
          unrecognizedObjectKeys: "strip",
      }) === "string" ? serializers.LiteralAliasExample.jsonOrThrow(optionalAliasLiteral, {
          unrecognizedObjectKeys: "strip",
      }) : JSON.stringify(serializers.LiteralAliasExample.jsonOrThrow(optionalAliasLiteral, {
          unrecognizedObjectKeys: "strip",
      }));
  }

  // after
  if (optionalAliasLiteral != null) {
      _queryParams["optional_alias_literal"] = serializers.LiteralAliasExample.jsonOrThrow(optionalAliasLiteral, {
          unrecognizedObjectKeys: "strip",
      });
  }
  ```

## [0.46.10] - 2025-01-14

- Fix: Use serialization layer to convert types to JSON strings when enabled.

## [0.46.9] - 2025-01-13

- Fix: Expose `baseUrl` as a default Client constructor option and construct URL correctly.

## [0.46.8] - 2025-01-13

- Fix: Generate the `version.ts` file correctly

## [0.46.7] - 2025-01-09

- Fix: Simplify runtime detection to reduce the chance of using an unsupported API like `process.`
  Detect Edge Runtime by Vercel.

## [0.46.6] - 2025-01-09

- Fix: Update `@types/node` to `18+`, required for the generated `Node18UniversalStreamWrapper` test.

## [0.46.5] - 2025-01-09

- Fix: Fix the webpack test to work with .js/.jsx extensions in TypeScript
- Fix: Only map .js modules in Jest, not .json files.

## [0.46.4] - 2025-01-09

- Fix: Fix packageJson custom configuration & package.json types field.

## [0.46.3] - 2025-01-09

- Fix: Revert to using legacy exports by default.

## [0.46.2] - 2025-01-09

- Fix: Fix Jest to work with files imported using `.js` extension.
- Fix: Make sure Jest loads Jest configuration regardless of package.json type.

## [0.46.1] - 2025-01-08

- Fix: ESModule output is fixed to be compatible with Node.js ESM loading.

## [0.46.0] - 2025-01-06

- Feat: SDKs are now built and exported in both CommonJS (legacy) and ESModule format.

- Feat: Export `serialization` code from root package export.
  ```ts
  import { serialization } from `@packageName`;
  ```

  The serialization code is also exported as `@packageName/serialization`.
  ```ts
  import * as serialization from `@packageName/serialization`;
  ```

- Feat: `package.json` itself is exported in `package.json` to allow consumers to easily read metadata about the package they are consuming.

## [0.45.2] - 2024-12-31

- Fix: TS generated snippets now respect proper parameter casing when noSerdeLayer is enabled.

## [0.45.1] - 2024-12-27

- Fix: Export everything inside of TypeScript namespaces that used to be ambient.

  For the `enableInlineTypes` feature, some namespaces were no longer declared (ambient), and types and interfaces inside the namespace would no longer be automatically exported without the `export` keyword. This fix exports everything that's inside these namespaces and also declared namespaces for good measure (in case they are not declared in the future).

## [0.45.0] - 2024-12-26

- Feat: Update dependencies of the generated TS SDK and Express generator. TypeScript has been updated to 5.7.2 which is a major version upgrade from 4.6.4.

## [0.44.5] - 2024-12-23

- Fix: Fix a bug where we attempt to parse an empty terminator when receiving streaming JSON responses.

## [0.44.4] - 2024-12-20

- Feat: Use specified defaults for pagination offset parameters during SDK generation.

## [0.44.3] - 2024-12-18

- Fix: Fix a bug where client would send request wrapper instead of the body of the request wrapper, when the request has inline path parameters and a body property.

## [0.44.2] - 2024-12-17

- Fix: Inline path parameters will use their original name when `retainOriginalName` or `noSerdeLayer` is enabled.

## [0.44.1] - 2024-12-16

- Fix: When there is an environment variable set, you do not need to pass in any parameters
  to the client constructor.

## [0.44.0] - 2024-12-13

- Feature: Inline path parameters into request types by setting `inlinePathParameters` to `true` in the generator config.

  Here's an example of how users would use the same endpoint method without and with `inlinePathParameters` set to `true`.

  Without `inlinePathParameters`:

  ```ts
  await service.getFoo("pathParamValue", { id: "SOME_ID" });
  ```

  With `inlinePathParameters`:

  ```ts
  await service.getFoo({ pathParamName: "pathParamValue", id: "SOME_ID" });
  ```

## [0.43.1] - 2024-12-11

- Fix: When `noSerdeLayer` is enabled, streaming endpoints were failing to compile because
  they assumed that the serialization layer existed. This is now fixed.

## [0.43.0] - 2024-12-11

- Feature: Generate inline types for inline schemas by setting `enableInlineTypes` to `true` in the generator config.
  When enabled, the inline schemas will be generated as nested types in TypeScript.
  This results in cleaner type names and a more intuitive developer experience.

  Before:

  ```ts
  // MyRootType.ts
  import * as MySdk from "...";

  export interface MyRootType {
    foo: MySdk.MyRootTypeFoo;
  }

  // MyRootTypeFoo.ts
  import * as MySdk from "...";

  export interface MyRootTypeFoo {
    bar: MySdk.MyRootTypeFooBar;
  }

  // MyRootTypeFooBar.ts
  import * as MySdk from "...";

  export interface MyRootTypeFooBar {}
  ```

  After:

  ```ts
  // MyRootType.ts
  import * as MySdk from "...";

  export interface MyRootType {
    foo: MyRootType.Foo;
  }

  export namespace MyRootType {
    export interface Foo {
      bar: Foo.Bar;
    }

    export namespace Foo {
      export interface Bar {}
    }
  }
  ```

  Now users can get the deep nested `Bar` type as follows:

  ```ts
  import { MyRootType } from MySdk;

  const bar: MyRootType.Foo.Bar = {};
  ```

## [0.42.7] - 2024-12-03

- Feature: Support `additionalProperties` in OpenAPI or `extra-properties` in the Fern Defnition. Now
  an object that has additionalProperties marked as true will generate the following interface:

  ```ts
  interface User {
    propertyOne: string;
    [key: string]: any;
  }
  ```

## [0.42.6] - 2024-11-23

- Fix: Remove the generated `APIPromise` since it is not compatible on certain node versions.

## [0.42.5] - 2024-11-23

- Fix: Remove extraenous import in pagination snippets.

## [0.42.4] - 2024-11-21

- Fix: Improve `GeneratedTimeoutSdkError` error to include endpoint name in message.

## [0.42.3] - 2024-11-22

- Fix: Fixed issue with snippets used for pagination endpoints.

## [0.42.2] - 2024-11-21

- Improvement: Added documentation for pagination in the README. The snippet below will
  now show up on generated READMEs.

  ```typescript
  // Iterate through all items
  const response = await client.users.list();
  for await (const item of response) {
    console.log(item);
  }

  // Or manually paginate
  let page = await client.users.list();
  while (page.hasNextPage()) {
    page = await page.getNextPage();
  }
  ```

## [0.42.1] - 2024-11-20

- Feat: Added support for passing additional headers in request options. For example:

  ```ts
  const response = await client.someEndpoint(..., {
    headers: {
      'X-Custom-Header': 'custom value'
    }
  });
  ```

## [0.42.0] - 2024-11-15

- Feat: Added support for `.asRaw()` which allows users to access raw response data including headers. For example:

  ```ts
  const response = await client.someEndpoint().asRaw();
  console.log(response.headers["X-My-Header"]);
  console.log(response.body);
  ```

## [0.41.2] - 2024-11-18

- Fix: Actually remove `jest-fetch-mock` from package.json.

## [0.41.1] - 2024-11-02

- Fix: Remove dev dependency on `jest-fetch-mock`.

## [0.41.0] - 2024-10-08

- Improvement: Add a variable jitter to the exponential backoff and retry.

## [0.41.0-rc2] - 2024-10-08

- Improvement: Generated READMEs now include improved usage snippets for pagination and streaming endpoints.

## [0.41.0-rc1] - 2024-10-08

- Fix: Fixes a broken unit test introduced in 0.41.0-rc0.

## [0.41.0-rc0] - 2024-10-08

- Feat: The generated SDK now supports bytes (`application/octet-stream`) requests.

## [0.40.8] - 2024-09-28

- Fix: File array uploads now call `request.appendFile` instead of `request.append` which
  was causing form data to be in a corrupted state.

## [0.40.7] - 2024-09-28

- Fix: The generated README will now have a section that links to the generated
  SDK Reference (in `reference.md`).

  ```md
  ## Reference

  A full reference for this library can be found [here](./reference.md).
  ```

## [0.40.6] - 2024-09-18

- Fix: The TypeScript SDK now supports specifying a custom contentType if one is specified.

## [0.40.5] - 2024-09-18

- Fix: The snippet templates for file upload are now accurate and also respect the feature
  flag `inlineFileProperties`.

## [0.40.4] - 2024-09-12

- Fix: Upgrades dependency `stream-json` which improves the performance when reading
  large API specs. This version will improve your `fern generate` performance.

## [0.40.3] - 2024-09-12

- Fix: If the serde layer is enabled, then all the serializers are exported under the
  namespace `serializers`.

  ```ts
  import { serializers } from "@plantstore/sdk";

  export function main(): void {
    // serialize to json

    const json = serializers.Plant.toJson({
      name: "fern"
    });

    const parsed = serializers.Plant.parseOrThrow(`{ "name": "fern" }`);
  }
  ```

## [0.40.2] - 2024-09-12

- Fix: The generated SDK now handles reading IR JSONs that are larger than 500MB. In order to
  to this, the function `streamObjectFromFile` is used instead of `JSON.parse`.

## [0.40.1] - 2024-09-12

- Fix: The generated snippets now inline referenced request objects given they are not named, they need to be inlined.

## [0.40.0] - 2024-09-12

- Feat: A new configuration flag has now been added that will automatically generate
  `BigInt` for `long` and `bigint` primitive types. To turn this flag on:

  ```yml
  groups:
    ts-sdk:
      name: fernapi/fern-typescript-node-sdk
      version: 0.40.0
      config:
        useBigInt: true
  ```

## [0.39.8] - 2024-09-11

- Fix: The generated enum examples now reference the value of the enum directly instead
  of using the enum itself.

  ### Before

  ```ts
  {
    "genre": Imdb.Genre.Humor,
  }
  ```

  ### After

  ```ts
  {
    "genre": "humor"
  }
  ```

## [0.39.7] - 2024-08-27

- Chore: The SDK now produces a `version.ts` file where we export a constant called `SDK_VERSION`.
  This constant can be used by different utilities to dynamically import in the version (for example, if someone wants to customize the user agent).

## [0.39.6] - 2024-08-27

- Fix: Browser clients can now import streams, via `readable-streams` polyfill. Additionally adds a
  webpack unit test to verify that the core utilities can be compiled.

## [0.39.5] - 2024-08-20

- Fix: If `noSerdeLayer` is enabled, then the generated TypeScript SDK snippets and wire tests
  will not use `Date` objects but instead use strings. Without this fix, the generated
  wire tests would result in failures.

## [0.39.4] - 2024-08-20

- Fix: Ensure that environment files don't generate, unless there is a valid environment available.

## [0.39.3] - 2024-08-16

- Fix: Multipart form data unit tests only get generated if the SDK has multipart form uploads.

## [0.39.2] - 2024-08-16

- Fix: Allows filenames to be passed from underlying File objects in Node 18+ and browsers
  Users can now supply files like so, using a simple multipart upload API as an example:
  ```typescript
  client.file.upload(new File([...blobParts], 'filename.ext'), ...)
  ```
  `filename.ext` will be encoded into the upload.

## [0.39.1] - 2024-08-07

- Feature: The SDK now supports looking directly at a `hasNextPage` property for offset pagination if configured.
  Previously the SDK would look if the number of items were empty, but this failed in certain edge cases.

## [0.38.6] - 2024-08-07

- Feature: The SDK generator now sends a `User-Agent` header on each request that is set to
  `<package>/<version>`. For example if your package is called `imdb` and is versioned `0.1.0`, then
  the user agent header will be `imdb/0.1.0`.

## [0.38.5] - 2024-08-07

- Fix: Addressed fetcher unit test flakiness by using a mock fetcher

## [0.38.4] - 2024-08-04

- Fix: Literal templates are generated if they are union members
- Fix: Snippet templates no longer try to inline objects within containers

## [0.38.3] - 2024-08-02

- Fix: Adds async iterable to StreamWrapper implementation for easier use with downstream dependencies.

## [0.38.2] - 2024-08-01

- Fix: Refactors the `noScripts` feature flag to make sure that no `yarn install` commands
  can be accidentally triggered.

## [0.38.1] - 2024-08-01

- Feature: A feature flag called `noScripts` has been introduced to prevent the generator
  from running any scripts such as `yarn format` or `yarn install`. If any of the scripts
  cause errors, toggling this option will allow you to receive the generated code.

  ```
  - name: fernapi/fern-typescript-node-sdk
    version: 0.38.1
    config:
      noScripts: true
  ```

## [0.38.0-rc0] - 2024-07-31

- internal: Upgrade to IRv53.
- chore: The generator now creates snippet templates for undiscriminated unions.

## [0.37.0-rc0] - 2024-07-29

- Feature: The business plan Typescript SDK will now generate wire tests if the feature flag
  in the configuration is turned on.

  ```
  - name: fernapi/fern-typescript-node-sdk
    version: 0.37.0-rc0
    config:
      generateWireTests: true
  ```

## [0.36.6] - 2024-07-29

- Fix: Now import paths are correctly added to getResponseBody tests. CI checks also added.

## [0.36.5] - 2024-07-29

- Fix: Now, server sent events are treated differently as streaming responses, to ensure the correct wrapping happens.

## [0.36.4] - 2024-07-26

- Fix: Now, import paths are correctly added to stream wrapper tests.

## [0.36.3] - 2024-07-26

- Fix: Support starting the stream on `StreamWrapper.pipe(...)` for shorter syntax when dealing with `node:stream` primitives.

## [0.36.2] - 2024-07-26

- Fix: This release comes with numerous improvements to streaming responses:

  1. Introduces new stream wrapper polyfills that implement the ability to stream to more streams, per environment.
  2. For `Node 18+`, stream responses can now be piped to `WritableStream`. They can also be streamed to `stream.Writable`, as possible before.
  3. For `< Node 18`, stream responses can be piped to `stream.Writeable`, as before.
  4. For `Browser` environments, stream responses can be piped to `WritableStream`.
  5. For `Cloudflare Workers`, stream responses can be piped to `WritableStream`.

- Fix: Now, there are generated unit tests for the `fetcher/stream-wrappers` core directory which makes sure that
  Fern's stream wrapping from responses work as expected!

## [0.36.1] - 2024-07-16

- Fix: Now, there are generated unit tests for the `auth` and `fetcher` core directory which makes sure that
  Fern's fetcher and authorization helpers work as expected!

## [0.36.0] - 2024-07-16

- Fix: Now, there are generated unit tests for the `schemas` core directory which makes sure that
  Fern's request + response validation will work as expected!

## [0.35.0] - 2024-07-16

- Fix: Support Multipart Form uploads where `fs.createReadStream` is passed. This requires
  coercing the stream into a `File`.

## [0.34.0] - 2024-07-16

- Internal: Upgrade to IRv50.
- Feature: Add support for generating an API version scheme in `version.ts`.
  Consider the following `api.yml` configuration:

  ```yaml
  version:
    header: X-API-Version
    default: "1.0.0"
    values:
      - "1.0.0-alpha"
      - "1.0.0-beta"
      - "1.0.0"
  ```

  The following `version.ts` file is generated:

  ```typescript
  /**
   * This file was auto-generated by Fern from our API Definition.
   */

  /** The version of the API, sent as the X-API-Version header. */
  export type AcmeVersion = "1.0.0" | "2.0.0" | "latest";
  ```

  If a default value is specified, it is set on every request but can be overridden
  in either the client-level `Options` or call-specific `RequestOptions`. If a default
  value is _not_ specified, the value of the header is required on the generated `Options`.

  An example call is shown below:

  ```typescript
  import { AcmeClient } from "acme";

  const client = new AcmeClient({ apiKey: "YOUR_API_KEY", xApiVersion: "2.0.0" });
  await client.users.create({
    firstName: "john",
    lastName: "doe"
  });
  ```

## [0.33.0] - 2024-07-16

- Fix: This release comes with numerous improvements to multipart uploads:

  1. `Fetcher.ts` no longer depends on form-data and formdata-node which reduces
     the size of the SDK for all consumers that are not leveraging multipart form
     data uploads.
  2. The SDK now accepts `fs.ReadStream`, `Blob` and `File` as inputs and handles
     parsing them appropriately.
  3. By accepting a `Blob` as a file parameter, the SDK now supports sending the
     filename when making a request.

## [0.32.0] - 2024-07-15

- Feature: The `reference.md` is now generated for every SDK.
- Improvement: The `reference.md` is now generated by the `generator-cli`.
- Fix: The `reference.md` includes a single section for the _first_ example specified
  on the endpoint. Previously, a separate section was included for _every_ example.

## [0.31.0] - 2024-07-12

- Feature: Add `omitUndefined` generator option. This is enabled with the following config:

  ```yaml
  groups:
    generators:
      - name: fernapi/fern-typscript-node-sdk
        version: 0.31.0
        ...
        config:
          omitUndefined: true
  ```

  When enabled, any property set to an explicit `undefined` is _not_ included
  in the serialized result. For example,

  ```typescript
  const request: Acme.CreateUserRequest = {
    firstName: "John",
    lastName: "Doe",
    email: undefined
  };
  ```

  By default, explicit `undefined` values are serialized as `null` like so:

  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": null
  }
  ```

  When `omitUndefined` is enabled, the JSON object is instead serialized as:

  ```json
  {
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

## [0.30.0] - 2024-07-11

- Feature: Client-level `Options` now supports overriding global headers like version.

## [0.29.2] - 2024-07-10

- Fix: This fixes a bug introduced in `0.29.0-rc0` that prevented the SDK from serializing types
  with circular references.

## [0.29.1] - 2024-07-10

- Fix: Pagination endpoints that define nested offset/cursor properties are now functional.
  A new `setObjectProperty` helper is used to dynamically set the property, which is inspired
  by Lodash's `set` function (https://lodash.com/docs/4.17.15#set).

  The generated code now looks like the following:

  ```typescript
  let _offset = request?.pagination?.page != null ? request?.pagination?.page : 1;
  return new core.Pageable<SeedPagination.ListUsersPaginationResponse, SeedPagination.User>({
    response: await list(request),
    hasNextPage: (response) => (response?.data ?? []).length > 0,
    getItems: (response) => response?.data ?? [],
    loadPage: (_response) => {
      _offset += 1;
      return list(core.setObjectProperty(request, "pagination.page", _offset));
    }
  });
  ```

## [0.29.0] - 2024-07-09

- Internal: Upgrade to IRv48.
- Feature: Add support for pagination endpoints that require request body properties.
- Feature: Add support for pagination with an offset step. This is useful for endpoints
  that page based on the element index rather than a page index (i.e. the 100th element
  vs. the 10th page).

  This feature shares the same UX as both the `offset` and `cursor` pagination variants.

## [0.29.0-rc0] - 2024-07-09

- Fix: All serializers in the generated SDK are now synchronous. This makes the serializers
  easier to use and improves the performance as well.

## [0.28.0-rc0] - 2024-07-09

- Feature: Add support for offset pagination, which uses the same pagination API introduced
  in `0.26.0-rc0`.

## [0.27.2] - 2024-07-08

- Fix: The generated readme now moves the sections for `AbortController`, `Runtime Compatiblity` and
  `Custom Fetcher` under the Advanced section in the generated README.

## [0.27.1] - 2024-07-08

- Feature: Support JSR publishing. If you would like your SDK to be published to JSR, there
  is now a configuration option called `publishToJsr: true`. When enabled, the generator will
  generate a `jsr.json` as well as a GitHub workflow to publish to JSR.

  ```yaml
  - name: fernapi/fern-typescript-sdk
    version: 0.27.1
    config:
      publishToJsr: true
  ```

## [0.27.0] - 2024-07-08

- Fix: Boolean literal headers can now be overridden via `RequestOptions`.
- Feature: The generated `.github/workflows/ci.yml` file now supports NPM publishing with
  alpha/beta dist tags. If the selected version contains the `alpha` or `beta` substring,
  the associated dist tag will be added in the `npm publish` command like the following:

  ```sh
  # Version 1.0.0-beta
  npm publish --tag beta
  ```

  For more on NPM dist tags, see https://docs.npmjs.com/adding-dist-tags-to-packages

## [0.26.0-rc3] - 2024-06-30

- Fix: The typesript generator now returns all `FormData` headers and Fetcher no longer stringifies stream.Readable type.

## [0.26.0-rc2] - 2024-06-27

- Improvement: `RequestOptions` now supports overriding global headers like authentication
  and version.

## [0.26.0-rc1] - 2024-06-27

- Fix: The generator was skipping auto pagination for item arrays that were optional. Now,
  those are safely handled as well.

## [0.26.0-rc0] - 2024-06-27

- Feature: The TypeScript generator now supports cursor-based auto pagination. With
  auto pagination, a user can simply iterate over the results automatically:

  ```ts
  for (const user of client.users.list()) {
    consoler.log(user);
  }
  ```

  Users can also paginate over data manually

  ```ts
  const page = client.users.list();
  for (const user of page.data) {
    consoler.log(user);
  }

  // Helper methods for manually paginating:
  while (page.hasNextPage()) {
    page = page.getNextPage();
    // ...
  }
  ```

## [0.25.3] - 2024-06-26

- Internal: The generator is now upgraded to `v46.2.0` of the IR.

## [0.25.2] - 2024-06-20

- Fix: The generator now removes `fs`, `path`, and `os` depdencencies from the browser
  runtime.

## [0.25.1] - 2024-06-20

- Fix: The generator now removes `fs`, `path`, and `os` depdencencies from the browser
  runtime.

## [0.25.0] - 2024-06-19

- Fix: The generator now generates snippets for streaming endpoints. There is also a
  fix where literals are excluded from inlined requests.

## [0.25.0-rc0] - 2024-06-19

- Feature: The generator now merges the user's original `README.md` file (if any).

## [0.24.4] - 2024-06-19

- Fix: APIs that specify a default environment no longer include an unused environment import
  in their generated snippets.

## [0.24.3] - 2024-06-18

- Fix: The generator only adds a publish step in github actions if credentials are specified.

## [0.24.2] - 2024-06-19

- Improvement: Remove the unnecessary client call from the request/response README.md section.
- Fix: The generated README.md snippets now correctly referenced nested methods. For example,
  `client.users.create` (instead of `client.create`) in the following:

  ```ts
  import { AcmeClient } from "acme";

  const client = new AcmeClient({ apiKey: "YOUR_API_KEY" });
  await client.users.create({
    firstName: "john",
    lastName: "doe"
  });
  ```

## [0.24.1] - 2024-06-19

- Fix: Dynamic snippets now support importing the client directly from the package.

  ```typescript
  import { MyClient } from "@org/sdk";

  const client = new MyClient({ ... });
  ```

## [0.24.0-rc0] - 2024-06-18

- Feature: Dynamic client instantiation snippets are now generated. Note this only affects
  enteprise users that are using Fern's Snippets API.

## [0.23.3] - 2024-06-17

- Fix: The NPM publish job is _not_ generated if the token environment variable is not specified.
- Improvement: The snippets now use the `client` variable name like so:

  ```ts
  import { AcmeClient } from "acme";

  const client = new AcmeClient({ apiKey: "YOUR_API_KEY" });
  await client.users.create({
    firstName: "john",
    lastName: "doe"
  });
  ```

## [0.23.2] - 2024-06-14

- Fix: Client constructor snippets now include an `environment` property whenever it's required.
- Fix: The import paths included in the `README.md` exclusively use double quotes.
- Fix: When an NPM package name is not specified, the generated `README.md` will default to using
  the namespace export.

## [0.23.1] - 2024-06-13

- Fix: Undiscriminated unions used as map keys examples no longer return an error.

## [0.23.0] - 2024-06-12

- Fix: The latest version of the `generator-cli` (used to generate `README.md` files) is
  always installed.

## [0.23.0-rc1] - 2024-06-11

- Feature: Introduce a custom configuration for arbitrary package json field. Now you can specify
  arbitrary key, value pairs that you want to be merged in the generated `package.json`.

  ```yml
  config:
    packageJson:
      dependencies:
        my-dep: "2.0.0"
      bin: "./index.js"
  ```

## [0.23.0-rc0] - 2024-06-07

- Fix: Union snippet templates are fixed in 2 ways:
  1. The templates do not have a leading single quote (a typo from before)
  2. The templates now inline union properties (in certain cases)

## [0.22.0] - 2024-06-07

- Feature: Add support for higher quality `README.md` generation.

## [0.21.1] - 2024-06-05

- Improvement: Detect `workerd` (Cloudflare) environments in `Runtime.ts`. The `Stream` class which is
  used for Server-Sent Events now prefers `TextDecoder` if it is present in the environment, to
  work in Cloudflare environments.

## [0.21.0] - 2024-06-05

- Feature: The generator now supports `bigint` types.
- Internal: Bump to IRv46.

## [0.20.9] - 2024-06-02

- Fix: TypeScript generator outputs code snippets that have `example-identifier` embedded.

## [0.20.8] - 2024-06-02

- Improvement: TypeScript projects were skipping added peer dependencies in certain cases,
  now those are fixed.

## [0.20.7] - 2024-05-31

- Fix: Simplify the error handling introduced in `0.20.6` so that it more easily
  handles endpoints that include structured errors.

## [0.20.6] - 2024-05-31

- Fix: This updates the behavior of the failure condition introduced in `0.20.2`; the SDK
  now throws an error whenever we fail to refresh an access token even if `neverThrowErrors`
  is set. We treat this failure as a systematic exception, so it's OK to throw in this case.

## [0.20.5] - 2024-05-30

- Improvement: Support setting `extraPeerDependencies` and `extraPeerDependenciesMeta` as
  configuration arguments. For example:

  ```yaml
  extraPeerDependencies:
    "openai": "^4.47.1"
  extraPeerDependenciesMeta:
    "openai":
      optional: true
  ```

## [0.20.4] - 2024-05-29

- Fix: Functionality to generate integration tests against a mock server has been disabled.

## [0.20.2] - 2024-05-29

- Fix: The OAuth token provider supports SDKs that enable the `neverThrowErrors` setting.
  If the OAuth token provider fails to retrieve and/or refresh an access token, an error
  will _not_ be thrown. Instead, the original access token will be used and the user will be
  able to act upon an error available on the response. For example,

  ```ts
  const response = await client.user.get(...)
  if (!response.ok) {
    // Handle the response.error ...
  }
  ```

## [0.20.1] - 2024-05-29

- Fix: Remove instances of `node:stream` so that the generated SDK is Webpack + Next.js compatible.

## [0.20.1-rc0] - 2024-05-29

- (Pre-emptive) Fix: URL encoded bodies are now appropriately encoded within the fetcher.

## [0.20.0-rc1] - 2024-05-24

- Fix: Pass `abortSignal` to `Stream` for server-sent-events and JSON streams so that the user
  can opt out and break from a stream.

## [0.20.0-rc0] - 2024-05-24

- Feature: Add `abortSignal` to `RequestOptions`. SDK consumers can now specify an
  an arbitrary abort signal that can interrupt the API call.

  ```ts
  const controller = new AbortController();
  client.endpoint.call(..., {
    abortSignal: controller.signal,
  })
  ```

## [0.19.0] - 2024-05-20

- Feature: Add `inlineFileProperties` configuration to support generating file upload properties
  as in-lined request properties (instead of positional parameters). Simply configure the following:

  ```yaml
  - name: fernapi/fern-typscript-node-sdk
    version: 0.19.0
    ...
    config:
      inlineFileProperties: true
  ```

  **Before**:

  ```ts
  /**
    * @param {File | fs.ReadStream} file
    * @param {File[] | fs.ReadStream[]} fileList
    * @param {File | fs.ReadStream | undefined} maybeFile
    * @param {File[] | fs.ReadStream[] | undefined} maybeFileList
    * @param {Acme.MyRequest} request
    * @param {Service.RequestOptions} requestOptions - Request-specific configuration.
    *
    * @example
    *     await client.service.post(fs.createReadStream("/path/to/your/file"), [fs.createReadStream("/path/to/your/file")], fs.createReadStream("/path/to/your/file"), [fs.createReadStream("/path/to/your/file")], {})
    */
  public async post(
      file: File | fs.ReadStream,
      fileList: File[] | fs.ReadStream[],
      maybeFile: File | fs.ReadStream | undefined,
      maybeFileList: File[] | fs.ReadStream[] | undefined,
      request: Acme.MyRequest,
      requestOptions?: Acme.RequestOptions
  ): Promise<void> {
    ...
  }
  ```

  **After**:

  ```ts
  /**
    * @param {Acme.MyRequest} request
    * @param {Service.RequestOptions} requestOptions - Request-specific configuration.
    *
    * @example
    *     await client.service.post({
    *        file: fs.createReadStream("/path/to/your/file"),
    *        fileList: [fs.createReadStream("/path/to/your/file")]
    *     })
    */
  public async post(
      request: Acme.MyRequest,
      requestOptions?: Service.RequestOptions
  ): Promise<void> {
    ...
  }
  ```

## [0.18.3] - 2024-05-17

- Internal: The generator now uses the latest FDR SDK.

## [0.18.2] - 2024-05-15

- Fix: If OAuth is configured, the generated `getAuthorizationHeader` helper now treats the
  bearer token as optional. This prevents us from sending the `Authorization` header
  when retrieving the access token.

## [0.18.1] - 2024-05-14

- Fix: If OAuth environment variables are specified, the `clientId` and `clientSecret` parameters
  are optional.

  ```ts
  export declare namespace Client {
    interface Options {
        ...
        clientId?: core.Supplier<string>;
        clientSecret?: core.Supplier<string>;
    }
    ...
  }
  ```

## [0.18.0] - 2024-05-13

- Feature: Add support for the OAuth client credentials flow. The new `OAuthTokenProvider` automatically
  resolves the access token and refreshes it as needed. The resolved access token is then used as the
  bearer token in all client requests.

## [0.17.1] - 2024-05-06

- Fix: Multipart form data requests are now compatible across browser and Node.js runtimes.

## [0.17.0] - 2024-05-06

- Internal: Bump to v43 of IR which means that you will need `0.26.1` of the Fern CLI version. To bump your
  CLI version, please run `fern upgrade`.

## [0.16.0-rc8] - 2024-05-06

- Improvement: The SDK generator now supports upload endpoints that specify an array of files like so:

  ```ts
  /**
    * @param {File[] | fs.ReadStream[]} files
    * @param {Acme.UploadFileRequest} request
    * @param {Service.RequestOptions} requestOptions - Request-specific configuration.
    */
  public async post(
      files: File[] | fs.ReadStream[],
      request: Acme.UploadFileRequest,
      requestOptions?: Service.RequestOptions
  ): Promise<void> {
      const _request = new FormData();
      for (const _file of files) {
        _request.append("files", _file);
      }
      ...
  }
  ```

## [0.16.0-rc7] - 2024-05-02

- Improvement: The SDK generator now supports `@param` JSDoc comments for endpoint parameters.
  The generator now arranges JSDoc in a few separate groups, one for each of `@param`, `@throws`,
  and `@examples` like so:

  ```ts
    /**
     * This endpoint checks the health of a resource.
     *
     * @param {string} id - A unique identifier.
     * @param {Service.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link Acme.UnauthorizedRequest}
     * @throws {@link Acme.BadRequest}
     *
     * @example
     *     await testSdk.health.service.check("id-2sdx82h")
     */
    public async check(id: string, requestOptions?: Service.RequestOptions): Promise<void> {
      ...
    }
  ```

- Improvement: The generator will only include user-provided examples if they exist, and otherwise
  only include a single generated example, like so:

  ```ts
    /**
     * This endpoint checks the health of a resource.
     *
     * @example
     *     await testSdk.health.service.check("id-2sdx82h")
     */
    public async check(id: string, requestOptions?: Service.RequestOptions): Promise<void> {
      ...
    }
  ```

- Fix: The SDK generator now escapes path parameters that would previously create invalid
  URLs (e.g. "\\example"). Method implementations will now have references to
  `encodeURIComponent` like the following:

  ```ts
  const _response = await core.fetcher({
    url: urlJoin(
      (await core.Supplier.get(this._options.environment)) ?? environments.AcmeEnvironment.Prod,
      `/users/${encodeURIComponent(userId)}`
    ),
    ...
  });
  ```

## [0.16.0-rc6] - 2024-04-30

- Fix: snippet templates now move file upload parameters to unnamed args

## [0.16.0-rc5] - 2024-04-30

- Fix: remove duplicate quotation marks in snippet templates

## [0.16.0-rc4] - 2024-04-25

- Fix: fixes to styling of the SDK code snippet templates.

## [0.16.0-rc0] - 2024-04-24

- Feature: The generator now registers snippet templates which can be used for dynamic
  SDK code snippet generation.

## [0.15.1-rc1] - 2024-04-24

- Improvement: Earlier for inlined request exports, we were doing the following:

```ts
export { MyRequest } from "./MyRequest";
```

In an effort to make the generated code JSR compatible, the TS generator
will now append the `type` explicitly for request exports.

```ts
export { type MyRequest } from "./MyRequest";
```

## [0.15.1-rc0] - 2024-04-22

- Feature: plain text responses are now supported in the TypeScript generator.

## [0.15.0-rc1] - 2024-04-22

- Fix: Minor fixes to SSE processing. In particular, stream terminal characters are now
  respected like `[DONE]` and JSON parsed data is sent to the deserialize function.

## [0.15.0-rc0] - 2024-04-19

- Feature: Bump to v38 of IR and support server-sent events where the events are sent
  with a `data: ` prefix and terminated with a new line.

## [0.14.1-rc5] - 2024-04-17

- Fix: Code snippets are generated for file upload endpoints using `fs.readStream`. Previously,
  generation for these endpoints was being skipped.

- Fix: If integration tests are not enabled, simple jest tests with a `yarn test`
  script will be created.

- Improvement: In an effort to make the generated code JSR compatible, the generator now
  directly imports from files instead of using directory imports.

- Improvement: In an effort to make the generated code JSR compatible, we make sure all methods
  are strongly typed with return signatures (in this case `_getAuthorizationHeader()`).

- Fix: Generate code snippet for FileDownload endpoint

- Fix: Import for `node-fetch` in `Fetcher.ts` uses a dynamic import instead of `require` which
  so that the SDK works in ESM environments (that are using local file output). When the
  `outputEsm` config flag is turned on, the dynamic import will be turned into an ESM specific import.

- Fix: The test job in `ci.yml` works even if you have not configured Fern to
  generate integration tests.

  Without integration tests the test job will run `yarn && yarn test`. With the
  integration tests, the test job will delegate to the fern cli `fern yarn test`.

- Feature: Add `allowExtraFields` option to permit extra fields in the serialized request.

  ```yaml
  - name: fernapi/fern-typscript-node-sdk
    version: 0.14.0-rc0
    ...
    config:
      allowExtraFields: true
  ```

## [0.13.0] - 2024-04-09

- Support V37 of the IR.

## [0.13.0-rc0] - 2024-04-02

- Feature: Add `retainOriginalCasing` option to preserve the naming convention expressed in the API.
  For example, the following Fern definition will generate a type like so:

```yaml
types:
  GetUsersRequest
    properties:
      group_id: string
```

**Before**

```typescript
export interface GetUsersRequest {
  groupId: string;
}

export interface GetUsersRequest = core.serialization.object({
 groupId: core.serialization.string("group_id")
})

export namespace GetUsersRequest {
  interface Raw {
    group_id: string
  }
}
```

**After**

```typescript
export interface GetUsersRequest {
  group_id: string;
}

export interface GetUsersRequest = core.serialization.object({
 group_id: core.serialization.string()
})

export namespace GetUsersRequest {
  interface Raw {
    group_id: string
  }
}
```

## [0.12.9] - 2024-03-22

- Fix: The generator stopped working for remote code generation starting in `0.12.7`. This is now fixed.

## [0.12.8] - 2024-03-22

- Improvement: Enhance serde performance by reducing reliance on async behavior and lazy async dynamic imports.
- Internal: Shared generator notification and config parsing logic.

## [0.12.8-rc0] - 2024-03-18

- Improvement: Enhance serde performance by reducing reliance on async behavior and lazy async dynamic imports.

## [0.12.7] - 2024-03-14

- Improvement: the SDK will now leverage environment variable defaults, where specified, for authentication variables, such as bearer tokens, api keys, custom headers, etc.

  Previously, the SDK would only leverage these defaults for bearer token auth IF auth was mandatory throughout the SDK.

## [0.12.6] - 2024-02-27

- In Node.js environments the SDK will default to using `node-fetch`. The
  SDK depends on v2 of node-fetch to stay CJS compatible.

  Previously the SDK was doing `require("node-fetch")` but it should be
  `require("node-fetch").default` based on
  https://github.com/node-fetch/node-fetch/issues/450#issuecomment-387045223.

## [0.12.5] - 2024-02-27

- Introduce a custom configuration called `tolerateRepublish` which supports running
  npm publish with the flag `--tolerateRepublish`. This flag allows you to publish
  on top of an existing npm package.

  To turn on this flag, update your generators.yml:

  ```yaml
  groups:
    generators:
      - name: fernapi/fern-typscript-node-sdk
        version: 0.12.5
        ...
        config:
          tolerateRepublish: true
  ```

## [0.12.4] - 2024-02-27

- Fix: Previously reference.md was just leveraging the function name for the reference, now it leverages the full package-scoped path, mirroring how the function would be used in reality.

```ts
seedExamples.getException(...)

// is now

seedExamples.file.notification.service.getException(...)
```

- Fix: Previously SDK code snippets would not support generation with undiscriminated unions. Now, it does.

## [0.12.2] - 2024-02-27

- Fix: Previously SDK code snippets would not take into account default parameter values
  and would always include a `{}`. This was odd and didn't represent how a developer
  would use the SDK. Now, the snippets check for default parameter values and omit
  if there are no fields specified.

  ```ts
  // Before
  client.users.list({});

  // After
  client.users.list();
  ```

## [0.12.1] - 2024-02-27

- Fix: Optional objects in deep query parameters were previously being incorrectly
  serialized. Before this change, optional objects were just being JSON.stringified
  which would send the incorrect contents over the wire.

  ```ts
  // Before
  if (foo != null) {
    _queryParams["foo"] = JSON.stringify(foo);
  }

  // After
  if (foo != null) {
    _queryParams["foo"] = foo;
  }

  // After (with serde layer)
  if (foo != null) {
    _queryParams["foo"] = serializers.Foo.jsonOrThrow(foo, {
      skipValidation: false,
      breadcrumbs: ["request", "foo"]
    });
  }
  ```

## [0.12.0] - 2024-02-26

- Feature: support deep object query parameter serialization. If, query parameters are
  objects then Fern will support serializing them.

  ```yaml
  MyFoo:
    properties:
      bar: optional<string>

  query-parameters:
    foo: MyFoo
  ```

  will now be serialized as `?foo[bar]="...` and appear in the SDK as a regular object

  ```ts
  client.doThing({
    foo: {
      bar: "..."
    }
  });
  ```

## [0.11.5] - 2024-02-15

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
