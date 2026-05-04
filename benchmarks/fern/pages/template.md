---
title: "{{TITLE}}"
slug: "{{SLUG}}"
description: "{{DESCRIPTION}}"
---

# {{TITLE}}

{{INTRO}}

## Overview

The Acme API provides a comprehensive set of tools for {{TOPIC_LOWER}}. This guide covers the key concepts, configuration options, and best practices for integrating this functionality into your application.

## Key concepts

| Concept | Description | Status |
|---------|-------------|--------|
| Core endpoint | Primary API surface for {{TOPIC_LOWER}} operations | Generally available |
| Batch mode | Process multiple items in a single request | Generally available |
| Async processing | Long-running operations with callback support | Generally available |
| Streaming | Real-time event delivery via Server-Sent Events | Beta |

## Getting started

To use {{TOPIC_LOWER}} in your application, you need:

1. A valid API key with the appropriate scopes
2. The Acme SDK installed in your project
3. A configured webhook endpoint (optional, for async operations)

### Installation

```bash
# Node.js / TypeScript
npm install @acme/sdk

# Python
pip install acme-sdk

# Go
go get github.com/acme/acme-go
```

### Basic usage

```typescript
import { AcmeClient } from "@acme/sdk";

const client = new AcmeClient({ apiKey: process.env.ACME_API_KEY });

// {{EXAMPLE_COMMENT}}
const result = await client.{{RESOURCE}}.create({
  name: "example-{{SLUG}}",
  config: {
    mode: "standard",
    timeout: 30000,
    retries: 3,
  },
});
console.log(`Created: ${result.id}`);
```

```python
from acme import Client

client = Client(api_key=os.environ["ACME_API_KEY"])

# {{EXAMPLE_COMMENT}}
result = client.{{RESOURCE}}.create(
    name="example-{{SLUG}}",
    config={
        "mode": "standard",
        "timeout": 30000,
        "retries": 3,
    },
)
print(f"Created: {result.id}")
```

## Configuration options

The following options are available when configuring {{TOPIC_LOWER}}:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mode` | string | `"standard"` | Processing mode: `standard`, `fast`, or `thorough` |
| `timeout` | integer | `30000` | Request timeout in milliseconds |
| `retries` | integer | `3` | Number of automatic retries on transient failures |
| `batch_size` | integer | `100` | Maximum items per batch request |
| `callback_url` | string | `null` | URL for async operation callbacks |
| `idempotency_key` | string | `null` | Unique key for idempotent requests |
| `metadata` | object | `{}` | Custom key-value pairs attached to the resource |
| `tags` | array | `[]` | Labels for filtering and organization |

## Error handling

```typescript
import { AcmeClient, AcmeError, RateLimitError } from "@acme/sdk";

try {
  const result = await client.{{RESOURCE}}.create({ name: "test" });
} catch (error) {
  if (error instanceof RateLimitError) {
    // Wait and retry after the specified delay
    const retryAfter = error.retryAfterSeconds;
    console.log(`Rate limited. Retry after ${retryAfter}s`);
  } else if (error instanceof AcmeError) {
    console.error(`API error ${error.statusCode}: ${error.message}`);
    console.error(`Request ID: ${error.requestId}`);
  } else {
    throw error;
  }
}
```

## Webhooks

Subscribe to {{TOPIC_LOWER}} events by registering a webhook:

```bash
curl -X POST https://api.acme.com/v1/webhooks \
  -H "Authorization: Bearer $ACME_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://yourapp.com/webhooks/acme",
    "events": ["{{RESOURCE}}.created", "{{RESOURCE}}.updated", "{{RESOURCE}}.deleted"]
  }'
```

### Event payload

```json
{
  "event_id": "evt_{{SLUG}}_abc123",
  "type": "{{RESOURCE}}.created",
  "created_at": "2024-06-15T10:30:00Z",
  "data": {
    "id": "{{SLUG}}_def456",
    "name": "example-{{SLUG}}",
    "status": "active",
    "created_at": "2024-06-15T10:30:00Z"
  }
}
```

## Pagination

List endpoints return paginated results:

```typescript
// Automatic pagination with async iterator
for await (const item of client.{{RESOURCE}}.list({ limit: 50 })) {
  console.log(item.id);
}

// Manual pagination
let cursor: string | undefined;
do {
  const page = await client.{{RESOURCE}}.list({ limit: 50, cursor });
  for (const item of page.data) {
    console.log(item.id);
  }
  cursor = page.next_cursor;
} while (cursor);
```

## Rate limits

{{TITLE}} endpoints have the following rate limits:

| Endpoint | Rate limit | Burst limit |
|----------|-----------|-------------|
| `GET /v1/{{RESOURCE}}` | 100 req/s | 200 req/s |
| `POST /v1/{{RESOURCE}}` | 50 req/s | 100 req/s |
| `PATCH /v1/{{RESOURCE}}/:id` | 50 req/s | 100 req/s |
| `DELETE /v1/{{RESOURCE}}/:id` | 20 req/s | 50 req/s |
| `POST /v1/{{RESOURCE}}/batch` | 10 req/s | 20 req/s |

## Best practices

1. **Use idempotency keys** for all write operations to safely handle retries
2. **Implement exponential backoff** when encountering rate limit errors
3. **Subscribe to webhooks** instead of polling for status changes
4. **Use batch endpoints** for bulk operations to reduce API calls
5. **Set appropriate timeouts** based on your use case
6. **Log request IDs** from error responses for debugging with Acme support
7. **Validate inputs client-side** before sending requests to reduce error rates
8. **Use metadata fields** to attach your internal identifiers to Acme resources

## Related resources

- [API Reference](/api-reference) - Full endpoint documentation
- [Error Codes](/error-codes) - Complete list of error codes
- [Rate Limiting](/rate-limiting) - Detailed rate limit information
- [Authentication](/authentication) - API key management
