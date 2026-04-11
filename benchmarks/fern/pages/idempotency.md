---
title: Idempotency
slug: idempotency
description: Safely retry requests without creating duplicate resources.
---

# Idempotency

The Acme API supports idempotency for safely retrying requests without the risk of performing the same operation twice. This is especially important for operations that create resources or process payments.

## How It Works

Include an `Idempotency-Key` header with a unique value (typically a UUID v4) in your request. If the API receives a second request with the same idempotency key, it returns the cached response from the first request instead of processing it again.

```bash
curl -X POST https://api.acme.com/v1/orders \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{"item": "widget", "quantity": 5}'
```

## Key Requirements

- Keys must be unique per operation — reusing a key with different request parameters returns a `409 Conflict` error
- Keys are scoped to your API account — different accounts can use the same key without conflict
- Keys expire after 24 hours — after expiration, the same key can be reused for a new operation

## Which Endpoints Support Idempotency

All `POST` endpoints support idempotency keys. `GET`, `PUT`, and `DELETE` requests are naturally idempotent and do not require the header.

| Method | Idempotent by Default | Key Required |
|--------|----------------------|--------------|
| GET | Yes | No |
| PUT | Yes | No |
| DELETE | Yes | No |
| POST | No | Recommended |
| PATCH | No | Recommended |

## Handling Responses

When a cached response is returned, the API includes an `Idempotent-Replayed: true` header so you can distinguish between fresh and replayed responses.

```python
import acme
import uuid

client = acme.Client(api_key="YOUR_API_KEY")

idempotency_key = str(uuid.uuid4())

# First call creates the order
order = client.orders.create(
    item="widget",
    quantity=5,
    idempotency_key=idempotency_key
)

# Second call with same key returns the same order
same_order = client.orders.create(
    item="widget",
    quantity=5,
    idempotency_key=idempotency_key
)

assert order.id == same_order.id
```

## Error Handling

If the original request failed with a server error (5xx), the idempotency key is not consumed and the request can be safely retried. Client errors (4xx) are cached — sending the same key will return the same error.

## Best Practices

1. Generate a new UUID for each logical operation
2. Store the idempotency key alongside the operation in your database for auditability
3. Implement automatic retries with the same key in your error handling logic
4. Do not reuse keys across different endpoints or different request bodies
