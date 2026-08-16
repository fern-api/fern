# Basic Auth CLI CLI Reference

Full command reference for `basic-auth-cli`.

## Commands

- [`basic-auth-cli system`](#basic-auth-cli-system)
- [`basic-auth-cli widgets`](#basic-auth-cli-widgets)

---

### `basic-auth-cli system`

#### `basic-auth-cli system health`

Health check

`GET /health`

---

### `basic-auth-cli widgets`

#### `basic-auth-cli widgets list`

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

