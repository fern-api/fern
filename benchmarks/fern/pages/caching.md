---
title: Caching
slug: caching
description: Optimize performance with HTTP caching and conditional requests.
---

# Caching

The Acme API supports standard HTTP caching mechanisms to reduce latency and bandwidth usage. Understanding caching behavior helps you build faster integrations.

## Cache Headers

### ETag

Every response includes an `ETag` header containing a hash of the resource. Use it for conditional requests.

```bash
# First request — returns full response with ETag
curl -i https://api.acme.com/v1/products/prod_123 \
  -H "Authorization: Bearer YOUR_API_KEY"

# HTTP/2 200
# ETag: "abc123def456"
# Content-Type: application/json
```

### Conditional GET

Send the ETag in an `If-None-Match` header. If the resource hasn't changed, the API returns `304 Not Modified` with no body, saving bandwidth.

```bash
curl -i https://api.acme.com/v1/products/prod_123 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "If-None-Match: \"abc123def456\""

# HTTP/2 304 Not Modified
# (no body)
```

### Cache-Control

List endpoints return a `Cache-Control` header indicating how long the response can be cached.

| Resource Type | Cache Duration | Header |
|--------------|---------------|--------|
| Product catalog | 5 minutes | `Cache-Control: max-age=300` |
| Configuration | 1 hour | `Cache-Control: max-age=3600` |
| Analytics | 15 minutes | `Cache-Control: max-age=900` |
| User data | No cache | `Cache-Control: no-store` |

## Conditional Updates

Use `If-Match` with PUT/PATCH requests to prevent overwriting changes made by other clients (optimistic concurrency control).

```bash
curl -X PUT https://api.acme.com/v1/products/prod_123 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "If-Match: \"abc123def456\"" \
  -H "Content-Type: application/json" \
  -d '{"price": 2999}'
```

If the ETag doesn't match (another client modified the resource), the API returns `412 Precondition Failed`.

## SDK Caching

```python
import acme

client = acme.Client(
    api_key="YOUR_API_KEY",
    cache=acme.InMemoryCache(max_size=1000, ttl=300)
)

# First call hits the API
product = client.products.get("prod_123")

# Second call returns cached response (if within TTL)
product = client.products.get("prod_123")

# Force a fresh fetch
product = client.products.get("prod_123", skip_cache=True)
```

```typescript
import { AcmeClient, InMemoryCache } from "acme";

const client = new AcmeClient({
  apiKey: "YOUR_API_KEY",
  cache: new InMemoryCache({ maxSize: 1000, ttlSeconds: 300 }),
});

const product = await client.products.get("prod_123");
```

## Cache Invalidation

Caches are automatically invalidated when:

- A resource is updated via PUT or PATCH
- A resource is deleted
- A bulk operation modifies the resource

The API returns a new ETag with every modification response, which your caching layer should store for future conditional requests.

## Best Practices

1. Always implement conditional GETs for resources you read frequently
2. Use `If-Match` for updates to avoid lost-update problems
3. Set up client-side caching for configuration and catalog data
4. Subscribe to webhooks for cache invalidation instead of polling
