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
| `--page-all` | Auto-paginate and stream all results |
| `--page-limit <N>` | Max pages to fetch (default: `10`) |
| `-q, --quiet` | Suppress stdout on success |
| `-h, --help` | Print help |
| `-V, --version` | Print version |

