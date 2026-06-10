# Users API (v1) CLI Reference

Full command reference for `acme-versioned`.

## Commands

- [`acme-versioned v1 users`](#acme-versioned-v1-users)
- [`acme-versioned v2 users`](#acme-versioned-v2-users)

---

### `acme-versioned v1 users`

#### `acme-versioned v1 users list-users`

List users (v1 shape)

`GET /users`

---

### `acme-versioned v2 users`

#### `acme-versioned v2 users list-users`

List users (v2 shape)

`GET /users`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--page-size` | `integer` | No |  |

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

