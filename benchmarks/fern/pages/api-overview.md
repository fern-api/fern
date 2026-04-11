---
title: API Overview
description: Understand the core concepts and architecture of the Square API platform.
slug: api-overview
---

# API Overview

The Square API follows RESTful conventions and uses JSON for request and response bodies. This page covers the fundamental concepts you'll encounter when working with the API.

## Base URLs

| Environment | Base URL |
|------------|----------|
| Production | `https://connect.squareup.com/v2` |
| Sandbox | `https://connect.squaresandbox.com/v2` |

## Request format

All API requests must include:

- `Authorization` header with a Bearer token
- `Content-Type: application/json` header for requests with a body
- `Square-Version` header (optional, defaults to the latest version)

```bash
curl -X POST https://connect.squareup.com/v2/payments \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'Square-Version: 2024-01-18' \
  -d '{
    "source_id": "cnon:card-nonce-ok",
    "idempotency_key": "unique-key-123",
    "amount_money": {
      "amount": 1000,
      "currency": "USD"
    }
  }'
```

## Response format

Successful responses return a JSON object. The response structure depends on the endpoint, but typically includes:

```json
{
  "payment": {
    "id": "R2B3Z8WMVt3EAmzYWLZvz7Y69EbZY",
    "created_at": "2024-01-15T20:14:30.639Z",
    "updated_at": "2024-01-15T20:14:31.098Z",
    "amount_money": {
      "amount": 1000,
      "currency": "USD"
    },
    "status": "COMPLETED",
    "source_type": "CARD"
  }
}
```

## Idempotency

Most write endpoints require an `idempotency_key` to ensure operations are only performed once, even if the request is retried. The key must be unique per operation and should be a UUID or similar unique string.

```typescript
import { v4 as uuid } from "uuid";

const response = await client.payments.create({
  sourceId: "cnon:card-nonce-ok",
  idempotencyKey: uuid(),
  amountMoney: {
    amount: BigInt(1000),
    currency: "USD",
  },
});
```

If you retry a request with the same idempotency key within 24 hours, the API returns the original response without performing the operation again.

## Versioning

Square uses date-based API versioning (e.g., `2024-01-18`). You can specify the version in the `Square-Version` header. If omitted, the API uses the version associated with your application.

Breaking changes are introduced in new versions only. Non-breaking changes (new fields, new endpoints) may be added to existing versions.

## Money amounts

All monetary amounts in the Square API are represented in the smallest currency unit (e.g., cents for USD):

| Display amount | API amount | Currency |
|---------------|------------|----------|
| $10.00 | 1000 | USD |
| 10.50 | 1050 | USD |
| 100.00 | 10000 | USD |
| 1,234.56 | 123456 | USD |

```typescript
// $25.50 in the API
const amount = {
  amount: BigInt(2550),
  currency: "USD",
};
```

## Cursor-based pagination

List endpoints return paginated results. Use the `cursor` field from the response to fetch the next page:

```typescript
let cursor: string | undefined;
const allCustomers = [];

do {
  const response = await client.customers.list({ cursor });
  if (response.customers) {
    allCustomers.push(...response.customers);
  }
  cursor = response.cursor;
} while (cursor);
```

## Error responses

Error responses include an `errors` array with details about what went wrong:

```json
{
  "errors": [
    {
      "category": "INVALID_REQUEST_ERROR",
      "code": "MISSING_REQUIRED_PARAMETER",
      "detail": "Missing required parameter: `source_id`",
      "field": "source_id"
    }
  ]
}
```

See [Error Handling](/error-handling) for details on error categories and codes.
