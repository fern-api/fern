# Server URL Templating API CLI Reference

Full command reference for `server-url-templating-api`.

## Commands

- [`server-url-templating-api auth`](#server-url-templating-api-auth)
- [`server-url-templating-api users`](#server-url-templating-api-users)

---

### `server-url-templating-api auth`

#### `server-url-templating-api auth get-token`

Get authentication token

`POST /auth/token`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

---

### `server-url-templating-api users`

#### `server-url-templating-api users get-user`

Get a user by ID

`GET /users/{userId}`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--user-id` | `string` | Yes |  |

#### `server-url-templating-api users get-users`

Get all users

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

