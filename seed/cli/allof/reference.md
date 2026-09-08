# allOf Composition CLI Reference

Full command reference for `allof-composition`.

## Commands

- [`allof-composition entities`](#allof-composition-entities)
- [`allof-composition organizations`](#allof-composition-organizations)
- [`allof-composition plants`](#allof-composition-plants)
- [`allof-composition rule-types`](#allof-composition-rule-types)
- [`allof-composition rules`](#allof-composition-rules)
- [`allof-composition trees`](#allof-composition-trees)
- [`allof-composition users`](#allof-composition-users)

---

### `allof-composition entities`

#### `allof-composition entities get-entity`

Get an entity that combines multiple parents

`GET /entities`

---

### `allof-composition organizations`

#### `allof-composition organizations get-organization`

Get an organization with merged object-typed properties

`GET /organizations`

---

### `allof-composition plants`

#### `allof-composition plants create-plant`

Tests three-level allOf chain where a parent schema itself uses allOf with $ref elements. The grandparent's properties must be resolved through the nested $ref.


`POST /plants`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

---

### `allof-composition rule-types`

#### `allof-composition rule-types search-rule-types`

Search rule types with paginated results

`GET /rule-types`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--query` | `string` | No |  |

---

### `allof-composition rules`

#### `allof-composition rules create-rule`

Create a rule with constrained execution context

`POST /rules`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

---

### `allof-composition trees`

#### `allof-composition trees create-tree`

Tests that when a parent's allOf contains multiple $ref entries, all of them are resolved and their properties merged.


`POST /trees`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

---

### `allof-composition users`

#### `allof-composition users list-users`

List users with paginated results

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
| `--no-extract` | Print the full response body instead of the `x-fern-sdk-return-value` extraction |
| `--no-retry` | Disable retries declared by `x-fern-retries`, including network errors |
| `-q, --quiet` | Suppress stdout on success |
| `-h, --help` | Print help |
| `-V, --version` | Print version |

Operations the spec describes how to page (via `x-fern-pagination` or a root `page_token` parameter) also accept:

| Flag | Description |
|------|-------------|
| `--page-all` | Auto-paginate and stream all results |
| `--page-limit <N>` | Max pages to fetch (default: `10`) |
| `--page-delay <MS>` | Delay between page fetches in milliseconds (default: `100`) |
| `--no-pager` | Disable the pager even on interactive terminals |

Operations the spec marks as streaming (via `x-fern-streaming`) also accept:

| Flag | Description |
|------|-------------|
| `--no-stream` | Buffer the streaming response and print it as a single value once complete |
