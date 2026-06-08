# Users API CLI Reference

Full command reference for `acme-cli`.

## Commands

- [`acme-cli invoices`](#acme-cli-invoices)
- [`acme-cli users`](#acme-cli-users)

---

### `acme-cli invoices`

#### `acme-cli invoices get-invoice`

Fetch a single invoice

`GET /invoices/{invoiceId}`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--invoice-id` | `string` | Yes |  |

#### `acme-cli invoices list-invoices`

List invoices

`GET /invoices`

---

### `acme-cli users`

#### `acme-cli users get-user`

Fetch a single user

`GET /users/{userId}`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--user-id` | `string` | Yes |  |

#### `acme-cli users list-users`

List users

`GET /users`

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

