# Reserved Keyword CLI CLI Reference

Full command reference for `reserved-keyword-cli`.

## Commands

- [`reserved-keyword-cli models`](#reserved-keyword-cli-models)

---

### `reserved-keyword-cli models`

#### `reserved-keyword-cli models get`

`GET /models/{model_id}`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--model-id` | `string` | Yes |  |

#### `reserved-keyword-cli models list`

`GET /models`

#### `reserved-keyword-cli models list-events`

`GET /models/events`

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

