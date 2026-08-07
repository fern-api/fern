# Optional referenced request bodies CLI Reference

Full command reference for `optional-referenced-request-bodies`.

## Commands

- [`optional-referenced-request-bodies refunds`](#optional-referenced-request-bodies-refunds)

---

### `optional-referenced-request-bodies refunds`

#### `optional-referenced-request-bodies refunds bulk-refund`

`POST /refunds`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | No | Request body as JSON (or use individual body-field flags) |

#### `optional-referenced-request-bodies refunds refund`

`POST /refunds/{id}`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--id` | `string` | Yes |  |
| `--json` | `JSON` | No | Request body as JSON (or use individual body-field flags) |

#### `optional-referenced-request-bodies refunds required-refund`

`POST /refunds/{id}/required`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--id` | `string` | Yes |  |
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
| `--page-all` | Auto-paginate and stream all results |
| `--page-limit <N>` | Max pages to fetch (default: `10`) |
| `-q, --quiet` | Suppress stdout on success |
| `-h, --help` | Print help |
| `-V, --version` | Print version |

