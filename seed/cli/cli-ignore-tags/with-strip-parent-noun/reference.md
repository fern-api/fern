# Knowledge API CLI Reference

Full command reference for `acme`.

## Commands

- [`acme knowledge`](#acme-knowledge)
- [`acme messages messages`](#acme-messages-messages)

---

### `acme knowledge`

#### `acme knowledge create`

Create a knowledge resource

`POST /v1/Knowledge`

#### `acme knowledge fetch-base`

Fetch a knowledge base

`GET /v1/KnowledgeBases/{id}`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--id` | `string` | Yes |  |

#### `acme knowledge fetch-operation`

Fetch an async operation

`GET /v1/Operations/{id}`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--id` | `string` | Yes |  |

#### `acme knowledge list-bases`

List knowledge bases

`GET /v1/KnowledgeBases`

#### `acme knowledge patch-base`

Update a knowledge base

`PATCH /v1/KnowledgeBases/{id}`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--id` | `string` | Yes |  |

---

### `acme messages messages`

#### `acme messages messages create`

Send a message

`POST /v1/Messages`

#### `acme messages messages list`

List messages

`GET /v1/Messages`

#### `acme messages messages list-media`

List media attached to a message

`GET /v1/Messages/{id}/Media`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--id` | `string` | Yes |  |

#### `acme messages messages list-media-v2`

List media attached to a message (v2 shape)

`GET /v1/Messages/{id}/MediaV2`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--id` | `string` | Yes |  |

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
