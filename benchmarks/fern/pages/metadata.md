---
title: Metadata
slug: metadata
description: Attach custom key-value data to any API resource.
---

# Metadata

Most Acme API resources support a `metadata` field where you can store arbitrary key-value pairs. This is useful for attaching your internal identifiers, configuration flags, or any other data your application needs.

## Setting Metadata

Include the `metadata` object when creating or updating a resource:

```bash
curl -X POST https://api.acme.com/v1/orders \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "usd",
    "metadata": {
      "internal_order_id": "PO-2025-0342",
      "department": "engineering",
      "cost_center": "CC-1234",
      "approved_by": "manager@example.com"
    }
  }'
```

## Updating Metadata

Use PATCH to update specific metadata keys without overwriting the entire object:

```bash
curl -X PATCH https://api.acme.com/v1/orders/order_123 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "shipping_carrier": "fedex",
      "tracking_number": "1234567890"
    }
  }'
```

To remove a metadata key, set its value to `null`:

```bash
curl -X PATCH https://api.acme.com/v1/orders/order_123 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"metadata": {"department": null}}'
```

## Searching by Metadata

Query resources by metadata values:

```bash
curl "https://api.acme.com/v1/orders?metadata[department]=engineering&metadata[cost_center]=CC-1234" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Limits

| Constraint | Limit |
|-----------|-------|
| Maximum keys per resource | 50 |
| Maximum key length | 40 characters |
| Maximum value length | 500 characters |
| Allowed key characters | Letters, numbers, underscores, hyphens |
| Value types | Strings only |

## SDK Usage

```python
import acme

client = acme.Client(api_key="YOUR_API_KEY")

# Create with metadata
order = client.orders.create(
    amount=5000,
    currency="usd",
    metadata={
        "internal_order_id": "PO-2025-0342",
        "department": "engineering"
    }
)

# Update metadata
client.orders.update(order.id, metadata={
    "shipping_carrier": "fedex"
})

# Search by metadata
orders = client.orders.list(
    metadata={"department": "engineering"}
)
```

```typescript
import { AcmeClient } from "acme";

const client = new AcmeClient({ apiKey: "YOUR_API_KEY" });

const order = await client.orders.create({
  amount: 5000,
  currency: "usd",
  metadata: {
    internal_order_id: "PO-2025-0342",
    department: "engineering",
  },
});

// Filter by metadata
const orders = await client.orders.list({
  metadata: { department: "engineering" },
});
```

## Best Practices

1. Use consistent key naming conventions across resources (e.g., `snake_case`)
2. Store only references (IDs, codes) rather than duplicating large data
3. Do not store sensitive information (PII, credentials) in metadata — it is not encrypted at rest
4. Use metadata for cross-system linking (e.g., mapping Acme order IDs to your ERP system)
5. Document your metadata schema internally so team members use consistent keys
