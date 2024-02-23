# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## Unreleased -->

## [0.17.0-rc0] - 2024-02-21

- Fix: Package documentation is now generated into the correct package's `doc.go`.
- Feature: Add support for generated endpoint snippets.
  - The snippets will be available in the API reference documentation, as well as the
    snippets API.
  - The snippets are _not_ embedded in the SDK itself (yet).

```go
import (
  context "context"
  time "time"
  acme "github.com/acme/acme-go"
  acmeclient "github.com/acme/acme-go/client"
  option "github.com/acme/acme-go/option"
)

client := acmeclient.NewClient(
  option.WithToken(
    "<YOUR_AUTH_TOKEN>",
  ),
)
response, err := client.User.Create(
  context.TODO(),
  &acme.CreateUserRequest{
    Username: "john",
    Language: acme.LanguageEnglish,
    Age:      acme.Int(32),
    Birthday: acme.MustParseDate(
      "1980-06-01"
    ),
  },
)
```

## [0.16.0] - 2024-02-12

- Feature: The generator now supports whitelabelling. When this is turned on,
  there will be no mention of Fern in the generated code.

  **Note**: You must be on the enterprise tier to enable this mode.

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
