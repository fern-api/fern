# Test x-fern-global-parameters extension CLI Reference

Full command reference for `test-x-fern-global-parameters-extension`.

## Commands

- [`test-x-fern-global-parameters-extension products`](#test-x-fern-global-parameters-extension-products)

---

### `test-x-fern-global-parameters-extension products`

#### `test-x-fern-global-parameters-extension products get`

`GET /v1/products/{regionId}/{productId}`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--region-id` | `string` | Yes |  |
| `--product-id` | `string` | Yes |  |

#### `test-x-fern-global-parameters-extension products search`

`POST /v1/products/{regionId}/search`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--region-id` | `string` | Yes |  |
| `--json` | `JSON` | No | Request body as JSON (or use individual body-field flags) |

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
