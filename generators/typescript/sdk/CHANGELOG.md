# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.14.1-rc1] - 2024-04-12

- Fix: Generate code snippet for FileDownload endpoint

## [0.14.1-rc0] - 2024-04-12

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
