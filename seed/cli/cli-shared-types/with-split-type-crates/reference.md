# Shared Types CLI CLI Reference

Full command reference for `shared-types-cli`.

## Commands

- [`shared-types-cli billing`](#shared-types-cli-billing)
- [`shared-types-cli catalog`](#shared-types-cli-catalog)
- [`shared-types-cli import`](#shared-types-cli-import)

---

### `shared-types-cli billing`

#### `shared-types-cli billing list-invoices`

List invoices

`GET /billing/invoices`

---

### `shared-types-cli catalog`

#### `shared-types-cli catalog list-categories`

List categories

`GET /catalog/categories`

#### `shared-types-cli catalog list-items`

List catalog items

`GET /catalog/items`

---

### `shared-types-cli import`

#### `shared-types-cli import import-item`

Import a catalog item

`POST /import`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
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

