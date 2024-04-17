# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## Unreleased -->

## [0.19.0 - 2024-04-16]

- Feature: The Go generator now supports environment variable scanning.

  For example, consider the following `api.yml` definition:

  ```yaml
  name: api
  auth: Bearer
  auth-schemes:
    Bearer:
      scheme: bearer
      token:
        name: apiKey
        env: ACME_API_KEY
  ```

  The client reads this environment variable and sets the value in the `Authorization` header
  if the `APIKey` option is not explicitly specified like so:

  ```go
  func NewClient(opts ...option.RequestOption) *Client {
    options := core.NewRequestOptions(opts...)
    if options.APIKey == "" {
      options.APIKey = os.Getenv("ACME_API_KEY")
    }
    return &Client{
      baseURL: options.BaseURL,
      caller: core.NewCaller(
        &core.CallerParams{
          Client:      options.HTTPClient,
          MaxAttempts: options.MaxAttempts,
        },
      ),
      // The header associated with the client will contain
      // the ACME_API_KEY value.
      //
      // It can still be overridden by endpoint-level request
      // options.
      header:  options.ToHeader(),
    }
  }
  ```

## [0.18.3 - 2024-04-15]

- Fix: Path parameters are now applied in the correct order. This is relevant for endpoints
  that specify more than one path parameter (e.g. `/organizations/{orgId}/users/{userId}`).
  Function signatures remain unchanged, such that they preserve the path parameter order
  specified by the API definition like so:

  ```go
  func (c *Client) Get(
    ctx context.Context,
    userID string,
    orgID string,
    opts ...option.RequestOption,
  ) (*acme.User, error) {
    ...
    endpointURL := fmt.Sprintf(baseURL+"/"+"organizations/%v/users/%v", orgID, userID)
    ...
  }
  ```

## [0.18.2 - 2024-04-02]

- Fix: Custom authorization header schemes had their values overridden by request options,
  which required using the generated request option at every call-site.

## [0.18.1 - 2024-03-12]

- Fix: Go snippets correctly handle unknown examples.

```go
response, err := client.CreateUser(
  ctx,
  &acme.CreateUserRequest{
    Name: "alice",
    Metadata: map[string]interface{}{
      "address": "123 Market Street",
      "age":     28,
    },
  },
)
```

## [0.18.0 - 2024-03-04]

- Feature: Add support for simpler unions, which is configurable with `union: v1` (if
  omitted, the default `v0` version will be used). With `v0`, a separate constructor for
  each variant of the union was generated, but using these constructors is cumbersome for
  large production APIs due to the sheer length of the function name. This improves the
  experience by simply setting the discriminant at runtime, which prevents the need for
  constructors entirely.

```yaml
- name: fernapi/fern-go-sdk
  version: 0.18.0
  config:
    union: v1
```

```go
// Before
union := acme.NewStatusFromCloudServerAlertStatus(
  &acme.CloudServerAlertStatus{
    Value: "WARNING",
  },
)
```

```go
// After
union := &acme.Status{
  CloudServerAlertStatus: &acme.CloudServerAlertStatus{
    Value: "WARNING",
  },
)
```

- Feature: Add support for multiple files in upload endpoints. Endpoints that specify
  multiple file parameters will include a `[]io.Reader` parameter, where each value
  is individually named. If the `io.Reader` does not contain a name, a name is generated.

```go
func (c *Client) Upload(
  ctx context.Context,
  fileList []io.Reader,
  opts ...option.RequestOption,
) error {
  ...
}
```

## [0.17.0] - 2024-02-26

- No changes since previous release candidate.

## [0.17.0-rc1] - 2024-02-23

- Fix: Snippets for aliases to optional primitive values. With this, the generated snippet
  will include the top-level pointer helpers (e.g. `acme.String(...)`).

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
