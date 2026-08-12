# Login Flow Test API CLI Reference

Full command reference for `login-flow`.

## Commands

- [`login-flow system`](#login-flow-system)
- [`login-flow tokens`](#login-flow-tokens)
- [`login-flow widgets`](#login-flow-widgets)

---

### `login-flow system`

#### `login-flow system health`

`GET /health`

---

### `login-flow tokens`

#### `login-flow tokens exchange`

Exchange client credentials for an access token

`POST /oauth/token`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

---

### `login-flow widgets`

#### `login-flow widgets get`

Get a widget

`GET /widgets/{widgetId}`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--widget-id` | `string` | Yes |  |

#### `login-flow widgets list`

List widgets

`GET /widgets`

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

