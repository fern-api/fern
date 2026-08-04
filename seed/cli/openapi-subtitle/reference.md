# Plant Store API CLI Reference

Full command reference for `plant-store-api`.

## Commands

- [`plant-store-api plants`](#plant-store-api-plants)

---

### `plant-store-api plants`

#### `plant-store-api plants get-plant`

Retrieve details about a specific plant by its unique identifier.

`GET /plants/{plantId}`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--plant-id` | `string` | Yes |  |

#### `plant-store-api plants list-plants`

Returns a paginated list of all plants currently in the store inventory.

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

