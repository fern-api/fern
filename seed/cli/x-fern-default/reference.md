# x-fern-default test CLI Reference

Full command reference for `x-fern-default-test`.

## Commands

- [`x-fern-default-test test`](#x-fern-default-test-test)

---

### `x-fern-default-test test`

#### `x-fern-default-test test test-get`

`GET /test/{region}/resource`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--region` | `string` | Yes |  |
| `--x-api-version` | `string` | No |  |
| `--limit` | `string` | No |  |

#### `x-fern-default-test test test-get-via-overrides`

`GET /test/{region}/resource-via-overrides`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--region` | `string` | Yes |  |
| `--x-api-version` | `string` | No |  |
| `--limit` | `string` | No |  |

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

