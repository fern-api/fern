# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## Unreleased -->

## [0.15.0] - 2024-02-09

- Feature: Enforce RFC3339 for date[time] serialization in request bodies.

## [0.14.1] - 2024-02-07

- Fix: Query parameter supoort for optional `time.Time` types.

## [0.14.0] - 2024-02-06

- Feature: Add support for `deepObject` query parameters.
- Chore: Refactor query parameter serialization with `url` struct tags.

## [0.13.0] - 2024-01-31

- Feature: Add `packageName` generator configuration.
- Feature: Add support for `bytes` request bodies wrapped in an in-lined request.

## [0.12.1] - 2024-01-31

- Fix: `text/plain` response handling.

## [0.12.0] - 2024-01-30

- Feature: Add support for `bytes` request bodies with `Content-Type` set to
  `application/octet-stream`.

## [0.11.0] - 2024-01-29

- Feature: Add automatic retry with exponential backoff.

## [0.10.0] - 2024-01-25

- Feature: Refactor `ClientOption` as `RequestOption`.
- Feature: Add `includeLegacyClientOptions` generator configuration.
- Feature: Support idempotency headers as a special `RequestOption` only available on
  idempotent endpoints.
- Fix: Placement of path parameter documentation.
- Fix: Naming collision issue for undiscriminated unions that define more than one
  literal.

## [0.9.4] - 2024-01-10

- Fix: File upload requests that specify query parameters.

## [0.9.3] - 2023-12-04

- Fix: Optional query parameter dereferencing issue.

## [0.9.2] - 2023-11-30

- Fix: Append version suffix for modules tagged with major versions greater than `1.X.X`.

## [0.9.1] - 2023-11-08

- Fix: Support boolean literals.
- Fix: Union subt-ypes with no properties are now go 1.13 compatible.

## [0.9.0] - 2023-10-31

- Feature: Add support for streaming endpoints.
- Feature: Add support for non-primitive file upload properties.
- Chore: Refactor `core.DoRequest` with `core.Caller` abstraction.
- Chore: Update pinned dependencies in generated `go.mod`.
