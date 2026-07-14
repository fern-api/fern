# OAuth Test API CLI Reference

Full command reference for `oauth-test`.

## Commands

- [`oauth-test health`](#oauth-test-health)
- [`oauth-test pets`](#oauth-test-pets)

---

### `oauth-test health`

#### `oauth-test health health`

`GET /health`

---

### `oauth-test pets`

#### `oauth-test pets list-pets`

`GET /pets`

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

