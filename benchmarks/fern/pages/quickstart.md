---
title: Quickstart
slug: quickstart
description: Get up and running with the Acme API in under 5 minutes.
---

# Quickstart

This guide walks you through making your first API call and building a simple integration with the Acme API.

## Prerequisites

- An Acme account (sign up at dashboard.acme.com)
- An API key (found in Settings / API Keys)

## Step 1: Make Your First Request

```bash
curl https://api.acme.com/v1/products \
  -H "Authorization: Bearer YOUR_API_KEY"
```

You should see a JSON response with a list of products.

## Step 2: Create a Resource

```bash
curl -X POST https://api.acme.com/v1/products \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Widget Pro",
    "price": 2999,
    "currency": "usd",
    "description": "A premium widget for professionals"
  }'
```

## Step 3: Install an SDK

Choose your preferred language:

### Python

```bash
pip install acme-python
```

```python
import acme

client = acme.Client(api_key="YOUR_API_KEY")

# List products
products = client.products.list(limit=10)
for product in products:
    print(f"{product.name}: ${product.price / 100:.2f}")

# Create an order
order = client.orders.create(
    items=[{"product_id": products[0].id, "quantity": 2}],
    customer_email="customer@example.com"
)
print(f"Order created: {order.id}")
```

### TypeScript / Node.js

```bash
npm install @acme/node
```

```typescript
import { AcmeClient } from "@acme/node";

const client = new AcmeClient({ apiKey: "YOUR_API_KEY" });

// List products
const products = await client.products.list({ limit: 10 });
products.forEach((p) => console.log(`${p.name}: $${p.price / 100}`));

// Create an order
const order = await client.orders.create({
  items: [{ productId: products[0].id, quantity: 2 }],
  customerEmail: "customer@example.com",
});
console.log(`Order created: ${order.id}`);
```

### Go

```bash
go get github.com/acme/acme-go
```

```go
package main

import (
    "context"
    "fmt"
    acme "github.com/acme/acme-go"
)

func main() {
    client := acme.NewClient("YOUR_API_KEY")

    products, _ := client.Products.List(context.Background(), &acme.ListParams{Limit: 10})
    for _, p := range products {
        fmt.Printf("%s: $%.2f\n", p.Name, float64(p.Price)/100)
    }
}
```

## Step 4: Set Up Webhooks

Receive real-time notifications when events occur:

```bash
curl -X POST https://api.acme.com/v1/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://yourapp.com/webhooks/acme",
    "events": ["order.created", "order.completed"]
  }'
```

## Step 5: Go Live

1. Replace your test API key (`sk_test_`) with your live key (`sk_live_`)
2. Update your base URL if you were using the sandbox
3. Set up error handling and retry logic
4. Enable webhook signature verification

## Next Steps

- Read the Authentication guide for advanced auth options
- Explore the API Reference for all available endpoints
- Set up your SDKs with proper error handling
- Configure webhooks for real-time event processing
