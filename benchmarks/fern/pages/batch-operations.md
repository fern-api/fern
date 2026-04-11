---
title: Batch Operations
slug: batch-operations
description: Process multiple resources in a single API call for better efficiency.
---

# Batch Operations

The Acme API provides batch endpoints that let you create, update, or delete multiple resources in a single request. This reduces network overhead and improves throughput for bulk operations.

## Batch Create

```bash
curl -X POST https://api.acme.com/v1/contacts/batch \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "operations": [
      {"method": "create", "data": {"name": "Alice", "email": "alice@example.com"}},
      {"method": "create", "data": {"name": "Bob", "email": "bob@example.com"}},
      {"method": "create", "data": {"name": "Carol", "email": "carol@example.com"}}
    ]
  }'
```

## Response Format

Batch responses return an array of results, one per operation, in the same order as the request. Each result includes a status code and either the created resource or an error.

```json
{
  "results": [
    {"status": 201, "data": {"id": "contact_1", "name": "Alice"}},
    {"status": 201, "data": {"id": "contact_2", "name": "Bob"}},
    {"status": 409, "error": {"code": "duplicate_email", "message": "Email already exists"}}
  ],
  "summary": {
    "total": 3,
    "succeeded": 2,
    "failed": 1
  }
}
```

## Limits

| Parameter | Limit |
|-----------|-------|
| Operations per batch | 100 |
| Request body size | 10 MB |
| Timeout | 120 seconds |

## Batch Update

```python
import acme

client = acme.Client(api_key="YOUR_API_KEY")

results = client.contacts.batch([
    acme.BatchOp.update("contact_1", name="Alice Smith"),
    acme.BatchOp.update("contact_2", name="Robert Jones"),
    acme.BatchOp.delete("contact_3"),
])

for result in results:
    if result.succeeded:
        print(f"OK: {result.data.id}")
    else:
        print(f"Failed: {result.error.message}")
```

## Atomicity

By default, batch operations are **non-atomic** — each operation is processed independently, and failures in one operation do not affect others.

For atomic batches where all operations must succeed or none are applied, add `"atomic": true` to the request body. Atomic batches are limited to 25 operations.

```bash
curl -X POST https://api.acme.com/v1/contacts/batch \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "atomic": true,
    "operations": [
      {"method": "create", "data": {"name": "Alice"}},
      {"method": "create", "data": {"name": "Bob"}}
    ]
  }'
```

## Async Batch Processing

For large batches that may take longer to process, use the async batch endpoint. This returns immediately with a batch job ID that you can poll for status.

```bash
# Start async batch
curl -X POST https://api.acme.com/v1/contacts/batch/async \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"operations": [...]}'

# Response: {"batch_id": "batch_xyz", "status": "processing"}

# Check status
curl https://api.acme.com/v1/batches/batch_xyz \
  -H "Authorization: Bearer YOUR_API_KEY"
```
