# Query Param Name Conflict API CLI Reference

Full command reference for `query-param-name-conflict-api`.

## Commands

- [`query-param-name-conflict-api task`](#query-param-name-conflict-api-task)

---

### `query-param-name-conflict-api task`

#### `query-param-name-conflict-api task bulk-update-tasks`

Bulk-update tasks. Query params and body share some property names.

`PUT /task/`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--assigned-to` | `string` | No |  |
| `--is-complete` | `string` | No |  |
| `--date` | `string` | No |  |
| `--fields` | `string` | No | Comma-separated list of fields to include in the response. |
| `--json` | `JSON` | No | Request body as JSON (or use individual body-field flags) |

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

