# Query Parameters API CLI Reference

Full command reference for `query-parameters-api`.

## Commands

- [`query-parameters-api user`](#query-parameters-api-user)

---

### `query-parameters-api user`

#### `query-parameters-api user search`

`GET /user/getUsername`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--limit` | `integer` | Yes |  |
| `--id` | `string` | Yes |  |
| `--date` | `string (date)` | Yes |  |
| `--deadline` | `string (date-time)` | Yes |  |
| `--bytes` | `string (base64)` | Yes |  |
| `--user` | `User` | Yes |  |
| `--user-list` | `User[]` | Yes |  |
| `--optional-deadline` | `string (date-time)` | No |  |
| `--key-value` | `object` | No |  |
| `--optional-string` | `string` | No |  |
| `--nested-user` | `NestedUser` | No |  |
| `--optional-user` | `User` | No |  |
| `--exclude-user` | `User[]` | No |  |
| `--filter` | `string[]` | No |  |
| `--tags` | `string[]` | Yes | List of tags. Serialized as a comma-separated list. |
| `--optional-tags` | `string[]` | No | Optional list of tags. Serialized as a comma-separated list. |
| `--neighbor` | `string` | No |  |
| `--neighbor-required` | `string` | Yes |  |

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

