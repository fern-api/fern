---
title: Analytics
slug: analytics
description: Access metrics and insights about your API usage and business data.
---

# Analytics

The Acme API provides analytics endpoints for monitoring API usage, tracking business metrics, and generating reports.

## Usage Metrics

### API Request Volume

```bash
curl "https://api.acme.com/v1/analytics/requests?period=7d&granularity=1h" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "period": "7d",
  "granularity": "1h",
  "total_requests": 142850,
  "data_points": [
    {"timestamp": "2025-03-15T00:00:00Z", "requests": 1250, "errors": 12, "p50_latency_ms": 45, "p99_latency_ms": 320},
    {"timestamp": "2025-03-15T01:00:00Z", "requests": 890, "errors": 3, "p50_latency_ms": 42, "p99_latency_ms": 280}
  ]
}
```

### Error Breakdown

```bash
curl "https://api.acme.com/v1/analytics/errors?period=24h&group_by=status_code" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "period": "24h",
  "total_errors": 156,
  "breakdown": [
    {"status_code": 429, "count": 89, "percentage": 57.1},
    {"status_code": 400, "count": 45, "percentage": 28.8},
    {"status_code": 500, "count": 22, "percentage": 14.1}
  ]
}
```

## Business Metrics

### Revenue Analytics

```bash
curl "https://api.acme.com/v1/analytics/revenue?period=30d&granularity=1d&currency=usd" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "period": "30d",
  "currency": "usd",
  "total_revenue": 1284500,
  "total_orders": 3421,
  "average_order_value": 37556,
  "data_points": [
    {"date": "2025-03-01", "revenue": 42150, "orders": 112},
    {"date": "2025-03-02", "revenue": 38900, "orders": 98}
  ]
}
```

### Top Products

```bash
curl "https://api.acme.com/v1/analytics/products/top?period=30d&limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Available Periods and Granularity

| Period | Allowed Granularity | Data Retention |
|--------|-------------------|----------------|
| `1h` | `1m`, `5m` | 48 hours |
| `24h` | `5m`, `15m`, `1h` | 30 days |
| `7d` | `1h`, `6h`, `1d` | 90 days |
| `30d` | `1d` | 1 year |
| `90d` | `1d`, `1w` | 2 years |
| `1y` | `1w`, `1mo` | 5 years |

## Custom Reports

Create ad-hoc reports with custom dimensions and metrics:

```python
import acme

client = acme.Client(api_key="YOUR_API_KEY")

report = client.analytics.create_report(
    metrics=["revenue", "order_count", "average_order_value"],
    dimensions=["product_category", "region"],
    filters={
        "period": "30d",
        "currency": "usd",
        "status": "completed"
    },
    sort="-revenue",
    limit=50
)

for row in report.rows:
    print(f"{row.product_category} ({row.region}): ${row.revenue / 100:.2f}")
```

## Real-Time Dashboard

For live metrics, use the SSE analytics stream:

```bash
curl -N "https://api.acme.com/v1/analytics/stream?metrics=requests,errors,latency_p50" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: text/event-stream"
```

This streams aggregated metrics every 10 seconds, suitable for powering a real-time monitoring dashboard.

## Rate Limits

Analytics endpoints have separate rate limits from the main API:

| Endpoint | Rate Limit |
|----------|-----------|
| Pre-aggregated metrics | 60 req/min |
| Custom reports | 10 req/min |
| Real-time stream | 5 concurrent connections |
