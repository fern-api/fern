# Path Param Body Collision CLI Reference

Full command reference for `path-param-body-collision`.

## Commands

- [`path-param-body-collision profiles`](#path-param-body-collision-profiles)

---

### `path-param-body-collision profiles`

#### `path-param-body-collision profiles update-profile-identifier`

`PATCH /Profiles/{profileId}/Identifiers/{idType}`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--profile-id` | `string` | Yes |  |
| `--id-type` | `string` | Yes |  |
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

