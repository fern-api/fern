# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.17.3] - 2024-07-31

- Internal: Upgrade to IRv53.

## [0.17.2] - 2024-07-16

- Internal: Upgrade to IRv48.

## [0.17.1] - 2024-07-10

- Fix: This fixes a bug introduced in `0.17.0-rc0` that prevented the SDK from serializing types
  with circular references.

## [0.17.0] - 2024-07-09

- Internal: Upgrade to IRv48.

## [0.17.0-rc0] - 2024-07-09

- Fix: All serializers in the generated express server are now synchronous. This makes the serializers
  easier to use and improves the performance as well.

## [0.16.3] - 2024-06-26

- Feature: The Express generator now supports a `requestValidationStatusCode` configuration
  where a user can specify the status code that should be thrown when the request doesn't
  match schema validation.

  ```yaml
  - name: fernapi/fern-typescript-express
    version: 0.16.3
    config:
      requestValidationStatusCode: 400 # Defaults to 422
  ```

## [0.16.2] - 2024-06-26

- Internal: The generator is now upgraded to `v46.2.0` of the IR.

## [0.16.1] - 2024-06-13

- Fix: Undiscriminated unions used as map keys examples no longer return an error.

## [0.16.0] - 2024-06-05

- Feature: The generator now supports `bigint` types.
- Internal: Bump to IRv46.

## [0.15.0] - 2024-05-13

- Feature: Every endpoint method now accepts a third parameter called `next`. This gives
  express authors access to the express internals if they are useful

  ```ts
  getUsers: (req, res, next: NextFunction) => {
    // implementation
  };
  ```

## [0.14.0] - 2024-05-13

- Feature: Support a `skipResponseValidation` configuration so that users can disable
  response validation. Note that this will still keep the serialization layer. To enable
  this configuration, add the following option to your `generators.yml`:

  ```yaml
  config:
    skipResponseValidation: true
  ```

## [0.13.0] - 2024-05-06

- Feature: Bump to v43 of IR which means that you will need `0.26.1` of the Fern CLI version. To bump your
  CLI version, please run `fern upgrade`.

  If you specify custom response status codes, the underlying express implementation will send that back
  to the user.

## [0.12.0] - 2024-05-07

- Improvement: Support a `skipRequestValidation` configuration so that users can disable
  request validation if they want to. To do so, add the following option to your
  `generators.yml`

  ```yaml
  config:
    skipRequestValidation: true
  ```

- Improvement: Remove unnecessary `console.error` statements whenever the server implementation
  throws an error. The router will now only log the warnings whenever an unrecognized error is
  thrown like so:

  ```ts
  try {
    ...
  } catch (error) {
      if (error instanceof errors.AcmeError) {
          console.warn(
              `Endpoint 'post' unexpectedly threw ${error.constructor.name}.` +
                  ` If this was intentional, please add ${error.constructor.name} to` +
                  " the endpoint's errors list in your Fern Definition."
          );
          await error.send(res);
      } else {
          res.status(500).json("Internal Server Error");
      }
      next(error);
  }
  ```

- Support V38 of the IR

## [0.11.0-rc0] - 2024-04-12

- Feature: Add `allowExtraFields` option to permit extra fields in the returned response.

  ```yaml
  - name: fernapi/fern-typscript-express
    version: 0.11.0-rc0
    ...
    config:
      allowExtraFields: true
  ```

## [0.10.0] - 2024-04-09

- Support V37 of the IR.

## [0.10.0-rc0] - 2024-04-02

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

## [0.9.9] - 2024-03-22

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
