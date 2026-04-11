---
title: Filtering & Sorting
slug: filtering
description: Learn how to filter, sort, and search API resources efficiently.
---

# Filtering & Sorting

Most list endpoints in the Acme API support filtering, sorting, and full-text search to help you retrieve exactly the data you need.

## Query Parameters

### Filtering

Use field-specific query parameters to filter results. Multiple filters are combined with AND logic.

```bash
# Get all active orders from the last 30 days
curl "https://api.acme.com/v1/orders?status=active&created_after=2025-03-01" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Supported Filter Operators

For fields that support range filtering, use suffixed parameters:

| Suffix | Operator | Example |
|--------|----------|---------|
| (none) | Equals | `status=active` |
| `_gt` | Greater than | `amount_gt=100` |
| `_gte` | Greater than or equal | `created_at_gte=2025-01-01` |
| `_lt` | Less than | `amount_lt=500` |
| `_lte` | Less than or equal | `created_at_lte=2025-12-31` |
| `_ne` | Not equal | `status_ne=cancelled` |
| `_in` | In list | `status_in=active,pending` |

### Sorting

Use the `sort` parameter with a field name. Prefix with `-` for descending order.

```bash
# Sort by creation date, newest first
curl "https://api.acme.com/v1/orders?sort=-created_at" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Sort by amount ascending, then by date descending
curl "https://api.acme.com/v1/orders?sort=amount,-created_at" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Full-Text Search

Endpoints that support search accept a `q` parameter for full-text queries.

```bash
curl "https://api.acme.com/v1/products?q=wireless+headphones" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Search results include a `_relevance_score` field indicating match quality.

## SDK Usage

```python
import acme

client = acme.Client(api_key="YOUR_API_KEY")

# Filter and sort orders
orders = client.orders.list(
    status="active",
    created_after="2025-03-01",
    amount_gte=100,
    sort=["-created_at"],
    limit=25
)

for order in orders:
    print(f"Order {order.id}: ${order.amount}")
```

```typescript
import { AcmeClient } from "acme";

const client = new AcmeClient({ apiKey: "YOUR_API_KEY" });

const orders = await client.orders.list({
  status: "active",
  createdAfter: "2025-03-01",
  amountGte: 100,
  sort: ["-created_at"],
  limit: 25,
});
```

## Performance Considerations

- Filtered queries are optimized when using indexed fields (`id`, `created_at`, `status`, `type`)
- Sorting on non-indexed fields may be slower for large datasets
- Combine filters with pagination for optimal performance on large result sets
- Full-text search queries are limited to 256 characters
