# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## Unreleased -->

## [0.22.3 - 2024-07-22]

- Fix: Fix an issue where APIs that specify the `property-name` error discrimination strategy would
  receive JSON decode errors instead of the server's error.

## [0.22.2 - 2024-07-04]

- Fix: Request types set to `nil` no longer send an explicit `null` value.

  ```go
  user, err := client.Users.Create(ctx, nil) // No request body is sent in the POST.
  ```

## [0.22.1 - 2024-06-11]

- Fix: Array of `deepObject` query parameters are correctly serialized. An array of objects
  are encoded like so:

  ```go
  user, err := client.Users.Get(
    ...,
    acme.GetUserRequest{
      Filters: []*acme.Filter{
        {
          Key: "age",
          Value: "42",
        },
        {
          Key: "firstName",
          Value: "john",
        },
      },
    },
  )
  // The query string is serialized as: ?filters[key]=age&filters[key]=firstName&filters[value]=42&filters[value]=john
  ```

## [0.22.0 - 2024-05-21]

- Feature: Extra properties decoded from response objects are retained and accessible via the
  `GetExtraProperties` method like so:

  ```go
  user, err := client.Users.Get(...)
  if err != nil {
    return nil, err
  }
  for key, value := range user.GetExtraProperties() {
    fmt.Printf("Got extra property; key: %s, value: %v\n", key, value)
  }
  ```

## [0.21.3 - 2024-05-17]

- Internal: The generator now uses the latest FDR SDK.

## [0.21.2 - 2024-05-07]

- Fix: In-lined request body properties no longer include a non-empty `url` struct tag. This previously caused
  request body properties to be encoded in the URL alongside the rest of the query parameters.

## [0.21.1 - 2024-04-29]

- Fix: The Go generator now escapes path parameters that would previously create invalid URLs (e.g. "\\example").
- Improvement: Refactor endpoint URL mapping with `core.EncodeURL`. All generated endpoints with path parameters
  now see use cases like the following:

  ```go
  endpointURL := core.EncodeURL(baseURL+"/organizations/%v", orgID)
  ```

## [0.21.0 - 2024-04-29]

- Feature: Add support for cursor and offset pagination.

  For example, consider the following endpoint `/users` endpoint:

  ```yaml
  types:
    User:
      properties:
        name: string

    ListUserResponse:
      properties:
        next: optional<string>
        data: list<User>

  service:
    auth: false
    base-path: /users
    endpoints:
      list:
        path: ""
        method: GET
        pagination:
          cursor: $request.starting_after
          next_cursor: $response.next
          results: $response.data
        request:
          name: ListUsersRequest
          query-parameters:
            starting_after: optional<string>
        response: ListUsersResponse
  ```

  The generated `client.Users.List` method now returns a generic `core.Page[T]`
  that can be used to fetch the next page like so:

  ```go
  page, err := client.Users.List(
    ctx,
    &acme.ListUsersRequest{
      StartingAfter: acme.String("user_xyz"),
    },
  )
  if err != nil {
    return nil, err
  }
  for page != nil {
    for _, user := range page.Results {
      fmt.Printf("Got user: %v\n", user.Name)
    }
    page, err = page.GetNextPage()
    if errors.Is(err, core.ErrNoPages) {
      break
    }
    if err != nil {
      // Handle the error!
    }
  }
  ```

  If you don't need to explicitly request every individual page, you can
  convert the `core.Page` into a `core.PageIterator` and simply iterate over
  each element like so:

  ```go
  page, err := client.Users.List(
    ctx,
    &acme.ListUsersRequest{
      StartingAfter: acme.String("user_xyz"),
    },
  )
  if err != nil {
    return nil, err
  }
  iter := page.Iterator()
  for iter.Next() {
    user := iter.Current()
    fmt.Printf("Got user: %v\n", user.Name)
  }
  if err := iter.Err(); err != nil {
    // Handle the error!
  }
  ```

  The iterator will automatically fetch the next page as needed and continue
  to iterate until all the pages are read.

## [0.20.2 - 2024-04-26]

- Improvement: Enhance extra property serialization performance.
- Improvement: Generate additional extra property tests into the SDK.
- Fix: Resolve an non-deterministic key ordering issue for snippets of
  type `unknown`.
- Fix: Resolve an issue with discriminated union serialization. This
  only occurs when the union varaint requires its own custom JSON
  serialization strategy _and_ the union variant contains the same
  properties as another object.

  For example, consider the following union definition:

  ```yaml
  Circle:
    properties:
      created_at: datetime

  Square:
    properties:
      created_at: datetime

  Shape:
    union:
      circle: Circle
      square: Square
  ```

  The generated `json.Marshaler` method now looks like the following, where
  the discriminant is added directly to the serialized JSON object:

  ```go
  func (s Shape) MarshalJSON() ([]byte, error) {
    if s.Circle != nil {
      return core.MarshalJSONWithExtraProperty(s.Circle, "type", "circle")
    }
    if s.Square != nil {
      return core.MarshalJSONWithExtraProperty(s.Square, "type", "square")
    }
    return nil, fmt.Errorf("type %T does not define a non-empty union type", s)
  }
  ```

## [0.20.1 - 2024-04-25]

- Fix: The `omitempty` struct tag is now only used for nil-able types. It was
  previously used for non-optional enums, which was never intended. For
  example, the following `RequestType` enum will no longer include an
  `omitempty` tag:

  ```go
  type Request struct {
    Type RequestType `json:"type" url:"type"`
  }
  ```

- Fix: Update the query encoder to prevent unintentional errors whenever the
  `omitempty` is used for a non-optional field.

## [0.20.0 - 2024-04-24]

- Feature: The Go generator now supports extra properties.

  For example, consider the following type definition:

  ```yaml
  types:
    User:
      extra-properties: true
      properties:
        name: string
  ```

  The generated `User` type will now have an `ExtraProperties` field like so:

  ```go
  type User struct {
    Name string `json:"name" url:"name"`

    ExtraProperties map[string]interface{} `json:"-" url:"-"`
  }
  ```

  If any extra properties are set, they will be sent alongside the rest of the
  defined properties, e.g. the `age` key in `{"name": "alice", "age": 42}`.

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
