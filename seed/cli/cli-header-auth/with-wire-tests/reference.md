# Header Auth CLI CLI Reference

Full command reference for `header-auth-cli`.

## Commands

- [`header-auth-cli system`](#header-auth-cli-system)
- [`header-auth-cli widgets`](#header-auth-cli-widgets)

---

### `header-auth-cli system`

#### `header-auth-cli system health`

Health check

`GET /health`

---

### `header-auth-cli widgets`

#### `header-auth-cli widgets list`

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
| `-q, --quiet` | Suppress stdout on success |
| `-h, --help` | Print help |
| `-V, --version` | Print version |

Paginated operations (those the spec marks with `x-fern-pagination`) also accept:

| Flag | Description |
|------|-------------|
| `--page-all` | Auto-paginate and stream all results |
| `--page-limit <N>` | Max pages to fetch (default: `10`) |

