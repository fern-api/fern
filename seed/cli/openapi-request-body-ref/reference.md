# openapi-request-body-ref CLI Reference

Full command reference for `openapi-request-body-ref`.

## Commands

- [`openapi-request-body-ref catalog`](#openapi-request-body-ref-catalog)
- [`openapi-request-body-ref team-member`](#openapi-request-body-ref-team-member)
- [`openapi-request-body-ref vendor`](#openapi-request-body-ref-vendor)

---

### `openapi-request-body-ref catalog`

#### `openapi-request-body-ref catalog create-catalog-image`

Upload a catalog image (multipart)

`POST /catalog/images`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

#### `openapi-request-body-ref catalog get-catalog-image`

Retrieve a catalog image

`GET /catalog/images/{image_id}`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--image-id` | `string` | Yes |  |

---

### `openapi-request-body-ref team-member`

#### `openapi-request-body-ref team-member update-team-member`

Update a team member (body ref, no extra params)

`PUT /team-members/{team_member_id}`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--team-member-id` | `string` | Yes |  |
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

---

### `openapi-request-body-ref vendor`

#### `openapi-request-body-ref vendor create-vendor`

Create a vendor

`POST /vendors`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--idempotency-key` | `string` | No |  |
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

#### `openapi-request-body-ref vendor update-vendor`

Update a vendor

`PUT /vendors/{vendor_id}`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--vendor-id` | `string` | Yes |  |
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

---

## Global flags

These flags are available on every command:

| Flag | Description |
|------|-------------|
| `--dry-run` | Print the HTTP request without sending it |
| `--json <JSON\|->` | Supply the request body as JSON (or `-` for stdin) |
| `--params <JSON>` | Merge extra parameters as JSON |
| `--format <json\|table\|yaml\|csv>` | Output format (default: `json`) |
| `--output <PATH>` | Write binary responses to a file |
| `--base-url <URL>` | Override the API base URL |
| `--no-extract` | Print the full response body instead of the `x-fern-sdk-return-value` extraction |
| `--no-retry` | Disable retries declared by `x-fern-retries`, including network errors |
| `-q, --quiet` | Suppress stdout on success |
| `-h, --help` | Print help |
| `-V, --version` | Print version |

Operations the spec describes how to page (via `x-fern-pagination` or a root `page_token` parameter) also accept:

| Flag | Description |
|------|-------------|
| `--page-all` | Auto-paginate and stream all results |
| `--page-limit <N>` | Max pages to fetch (default: `10`) |
| `--page-delay <MS>` | Delay between page fetches in milliseconds (default: `100`) |
| `--no-pager` | Disable the pager even on interactive terminals |

Operations the spec marks as streaming (via `x-fern-streaming`) also accept:

| Flag | Description |
|------|-------------|
| `--no-stream` | Buffer the streaming response and print it as a single value once complete |
