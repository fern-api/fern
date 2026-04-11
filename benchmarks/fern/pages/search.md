---
title: Search
slug: search
description: Full-text and semantic search across your API resources.
---

# Search

The Acme API provides powerful search capabilities including full-text search, faceted search, and semantic (AI-powered) search across your resources.

## Full-Text Search

```bash
curl "https://api.acme.com/v1/search?q=wireless+bluetooth+headphones&type=products" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "query": "wireless bluetooth headphones",
  "total_results": 47,
  "results": [
    {
      "type": "product",
      "id": "prod_abc",
      "score": 0.95,
      "highlights": {
        "name": "<em>Wireless</em> <em>Bluetooth</em> <em>Headphones</em> Pro",
        "description": "Premium <em>wireless</em> <em>headphones</em> with active noise cancellation and <em>Bluetooth</em> 5.3"
      },
      "data": {
        "name": "Wireless Bluetooth Headphones Pro",
        "price": 14999,
        "category": "electronics"
      }
    }
  ]
}
```

## Search Options

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query (required) |
| `type` | string | Resource type to search |
| `fields` | string[] | Specific fields to search in |
| `filters` | object | Additional field filters |
| `sort` | string | Sort results (`_relevance`, field name) |
| `limit` | integer | Max results (default 20, max 100) |
| `offset` | integer | Pagination offset |

## Faceted Search

Get aggregated counts for filtering:

```bash
curl "https://api.acme.com/v1/search?q=headphones&facets=category,brand,price_range" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "results": [...],
  "facets": {
    "category": [
      {"value": "electronics", "count": 35},
      {"value": "accessories", "count": 12}
    ],
    "brand": [
      {"value": "Acme Audio", "count": 18},
      {"value": "SoundMax", "count": 15}
    ],
    "price_range": [
      {"min": 0, "max": 5000, "count": 8},
      {"min": 5000, "max": 15000, "count": 25},
      {"min": 15000, "max": 50000, "count": 14}
    ]
  }
}
```

## Semantic Search

Use AI-powered semantic search to find results based on meaning rather than exact keywords:

```bash
curl "https://api.acme.com/v1/search/semantic?q=something+to+listen+to+music+while+running&type=products" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Semantic search understands intent and context, so "something to listen to music while running" would match sports earbuds and sweat-resistant headphones even if those exact words are not in the product description.

## Search Suggestions

Get autocomplete suggestions as the user types:

```bash
curl "https://api.acme.com/v1/search/suggest?prefix=wire&type=products" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "suggestions": [
    {"text": "wireless headphones", "count": 47},
    {"text": "wireless charger", "count": 23},
    {"text": "wireless keyboard", "count": 15}
  ]
}
```

## SDK Usage

```python
import acme

client = acme.Client(api_key="YOUR_API_KEY")

# Full-text search with facets
results = client.search.query(
    q="headphones",
    type="products",
    filters={"category": "electronics", "price_lte": 20000},
    facets=["brand", "price_range"],
    limit=20
)

for hit in results.hits:
    print(f"{hit.data.name} (score: {hit.score:.2f})")

# Semantic search
results = client.search.semantic(
    q="comfortable work from home setup",
    type="products",
    limit=10
)
```

## Indexing

Resources are automatically indexed when created or updated. The search index is eventually consistent, with typical indexing latency under 2 seconds.

To force a re-index of a specific resource:

```bash
curl -X POST "https://api.acme.com/v1/search/reindex/products/prod_abc" \
  -H "Authorization: Bearer YOUR_API_KEY"
```
