# Schemaless Request Body Examples API CLI Reference

Full command reference for `schemaless-request-body-examples-api`.

## Commands

- [`schemaless-request-body-examples-api plants`](#schemaless-request-body-examples-api-plants)

---

### `schemaless-request-body-examples-api plants`

#### `schemaless-request-body-examples-api plants create-plant`

Creates a plant with example JSON but no request body schema.

`POST /plants`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

#### `schemaless-request-body-examples-api plants create-plant-with-schema`

A control endpoint that has both schema and example defined.

`POST /plants/with-schema`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

#### `schemaless-request-body-examples-api plants update-plant`

Updates a plant with example JSON but no request body schema.

`PUT /plants/{plantId}`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--plant-id` | `string` | Yes |  |
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

