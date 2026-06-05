# server-sent-events-openapi CLI Reference

Full command reference for `server-sent-events-openapi`.

## Commands

- [`server-sent-events-openapi stream`](#server-sent-events-openapi-stream)
- [`server-sent-events-openapi validate-completion`](#server-sent-events-openapi-validate-completion)
- [`server-sent-events-openapi validate-union-request`](#server-sent-events-openapi-validate-union-request)

---

### `server-sent-events-openapi stream`

#### `server-sent-events-openapi stream stream-data-context`

x-fern-discriminator-context is explicitly set to "data" (the default value). Each variant uses allOf to extend a payload schema and adds the "event" discriminant property at the same level. There is no "data" wrapper. The discriminant and payload fields coexist in a single flat object. This matches the real-world pattern used by customers with context=data.


`POST /stream/data-context`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

#### `server-sent-events-openapi stream stream-data-context-with-envelope-schema`

Mismatched combination: context=data with the envelope+data schema pattern that is normally used with context=protocol. Shows what happens when the discriminant is declared as data-level but the schema separates the event field and data field into an envelope structure.


`POST /stream/data-context-with-envelope-schema`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

#### `server-sent-events-openapi stream stream-no-context`

The x-fern-discriminator-context extension is omitted entirely. Tests whether Fern correctly infers the default behavior (context=data) when the extension is absent. Same flat allOf pattern as endpoint 3.


`POST /stream/no-context`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

#### `server-sent-events-openapi stream stream-oas-spec-native`

Follows the pattern from the OAS 3.2 specification's own SSE example. The itemSchema extends a base Event schema via $ref and uses inline oneOf variants with const on the event field to distinguish event types. Data fields use contentSchema/contentMediaType for structured payloads. No discriminator object is used. Event type resolution relies on const matching.


`POST /stream/oas-spec-native`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

#### `server-sent-events-openapi stream stream-protocol-collision`

Same as endpoint 1, but the object data payload contains its own "event" property, which collides with the SSE envelope's "event" discriminator field. Tests whether generators correctly separate the protocol-level discriminant from the data-level field when context=protocol is specified.


`POST /stream/protocol-collision`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

#### `server-sent-events-openapi stream stream-protocol-no-collision`

Uses discriminator with mapping, x-fern-discriminator-context set to protocol. Because the discriminant is at the protocol level, the data field can be any type or absent entirely. Demonstrates heartbeat (no data), string literal, number literal, and object data payloads.


`POST /stream/protocol-no-collision`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

#### `server-sent-events-openapi stream stream-protocol-with-flat-schema`

Mismatched combination: context=protocol with the flat allOf schema pattern that is normally used with context=data. Shows what happens when the discriminant is declared as protocol-level but the schema uses allOf to flatten the event field alongside payload fields instead of wrapping them in a data field.


`POST /stream/protocol-with-flat-schema`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

#### `server-sent-events-openapi stream stream-x-fern-streaming-condition`

Uses x-fern-streaming extension with stream-condition to split into streaming and non-streaming variants based on a request body field. The request body is a $ref to a named schema. The response and response-stream point to different schemas.


`POST /stream/x-fern-streaming-condition`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

#### `server-sent-events-openapi stream stream-x-fern-streaming-nullable-condition`

Uses x-fern-streaming with stream-condition where the stream field is nullable (type: ["boolean", "null"] in OAS 3.1). Previously, the spread order in the importer caused the nullable type array to overwrite the const literal, producing stream?: true | null instead of stream: true. The const/type override must be spread after the original property.


`POST /stream/x-fern-streaming-nullable-condition`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

#### `server-sent-events-openapi stream stream-x-fern-streaming-shared-schema`

Uses x-fern-streaming with stream-condition. The request body $ref (SharedCompletionRequest) is also referenced by a separate non-streaming endpoint (/validate-completion). This tests that the shared request schema is not excluded from the context during streaming processing.


`POST /stream/x-fern-streaming-shared-schema`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

#### `server-sent-events-openapi stream stream-x-fern-streaming-sse-only`

Uses x-fern-streaming with format: sse but no stream-condition. This represents a stream-only endpoint that always returns SSE. There is no non-streaming variant, and the response is always a stream of chunks.


`POST /stream/x-fern-streaming-sse-only`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

#### `server-sent-events-openapi stream stream-x-fern-streaming-union`

Uses x-fern-streaming with stream-condition where the request body is a discriminated union (oneOf) whose variants inherit the stream condition field (stream_response) from a shared base schema via allOf. Tests that the stream condition property is not duplicated in the generated output when the base schema is expanded into each variant.


`POST /stream/x-fern-streaming-union`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

---

### `server-sent-events-openapi validate-completion`

#### `server-sent-events-openapi validate-completion validate-completion`

A non-streaming endpoint that references the same SharedCompletionRequest schema as endpoint 10. Ensures the shared $ref schema remains available and is not excluded during the streaming endpoint's processing.


`POST /validate-completion`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--json` | `JSON` | Yes | Request body as JSON (or use individual body-field flags) |

---

### `server-sent-events-openapi validate-union-request`

#### `server-sent-events-openapi validate-union-request validate-union-request`

References UnionStreamRequestBase directly, ensuring the base schema cannot be excluded from the context. This endpoint exists to verify that shared base schemas used in discriminated union variants with stream-condition remain available.


`POST /validate-union-request`

| Flag | Type | Required | Description |
|------|------|----------|-------------|
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

