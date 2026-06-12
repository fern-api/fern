# OAuth Client Credentials OpenAPI CLI Reference

Full command reference for `oauth-client-credentials-openapi`.

## Commands

- [`oauth-client-credentials-openapi identity`](#oauth-client-credentials-openapi-identity)
- [`oauth-client-credentials-openapi plants`](#oauth-client-credentials-openapi-plants)

---

### `oauth-client-credentials-openapi identity`

#### `oauth-client-credentials-openapi identity get-token`

Get an access token

`POST /identity/token`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

---

### `oauth-client-credentials-openapi plants`

#### `oauth-client-credentials-openapi plants get`

Get a plant by ID

`GET /plants/{plantId}`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--plant-id` | `string` | Yes |  |

#### `oauth-client-credentials-openapi plants list`

List all plants

`GET /plants`

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

