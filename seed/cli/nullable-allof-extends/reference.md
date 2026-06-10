# Nullable AllOf Extends Test CLI Reference

Full command reference for `nullable-allof-extends-test`.

## Commands

- [`nullable-allof-extends-test test`](#nullable-allof-extends-test-test)

---

### `nullable-allof-extends-test test`

#### `nullable-allof-extends-test test create-test`

Creates a test object with nullable allOf in request body.

`POST /test`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

#### `nullable-allof-extends-test test get-test`

Returns a RootObject which inherits from a nullable schema.

`GET /test`

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

