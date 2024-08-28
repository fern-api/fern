# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.40.0] - 2024-08-19

- Internal: Update the `fern generator upgrade` command to leverage the FDR API as opposed to Docker and dockerode.

## [0.39.19] - 2024-08-25

- Fix: The OpenAPI importer now handles generating examples for referenced `oneOf` schemas. Previously,
  examples generation would fail.
- Fix: The OpenAPI importer now handles generating examples for circular `oneOf` schemas. Previously, the
  the converter would only default to generating examples for the first `oneOf` schema. If the first variant,
  circularly referenced itself, this would make terminating the example impossible.
  Now, the example generator tries every schema in order, guaranteeing that a termination condition will be
  reached.

## [0.39.18] - 2024-08-23

- Internal: Produce IR v57.8.0 with raw datetime examples. The raw datetime examples help
  when generating test fixtures to assert conditions about the original datetime.

## [0.39.17] - 2024-08-23

- Fix: Previously, object declarations with extends and no properties did not have examples
  propagating in the Docs and SDKs. The core issue was in IR generation which has now
  been resolved.

  The following will now work as expected:

  ```yaml
  types:
    ObjectWithNoProperties:
      extends:
        - ParentA
        - ParentB
      examples:
        - name: Default
          value:
            propertyFromParentA: foo
            propertyFromParentB: bar
  ```

## [0.39.16] - 2024-08-21

- Chore: Support running 0.2.x versions of the Postman Generator with IR V53 or above.

## [0.39.15] - 2024-08-21

- Internal: Introduce `generator list` and `organization` commands to faciliate actions taken by `fern-bot`

## [0.39.14] - 2024-08-21

- Fix: Format validation is enforced on `date` fields that are specified in examples specified in an api defintion.

## [0.39.13] - 2024-08-19

- Fix: Generated examples in the Intermediate Representation not respect root level path parameter examples. Previously, when ignored,
  this would result in invalid cURL examples in documentation.

## [0.39.12] - 2024-08-19

- Fix: The mock folder now includes source files, and the CLI no longer hard fails if it cannot resolve source files that are of OpenAPI type.

## [0.39.11] - 2024-08-18

- Fix: The Fern CLI now handles parsing `x-fern-parameter-name` on path parameters in an OpenAPI spec. For example,
  if you want to rename a path parameter in the generated SDK, you can now do:

  ```yml
  paths:
    "/user":
        get:
        operationId: list_user
        parameters:
            - in: header
            name: X-API-Version
            x-fern-parameter-name: version
            schema:
                type: string
            required: true
  ```

  For more information, please check out the [docs](https://buildwithfern.com/learn/api-definition/openapi/extensions/parameter-names).

## [0.39.10] - 2024-08-18

- Chore: Intialize this changelog
