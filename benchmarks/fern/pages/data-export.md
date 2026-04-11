---
title: Data Export
slug: data-export
description: Export your data in bulk for analytics and compliance.
---

# Data Export

The Acme API provides bulk data export capabilities for analytics, reporting, and compliance requirements. Exports run asynchronously and deliver results as downloadable files.

## Creating an Export

```bash
curl -X POST https://api.acme.com/v1/exports \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "resource": "orders",
    "format": "csv",
    "filters": {
      "created_after": "2025-01-01",
      "created_before": "2025-03-31",
      "status": "completed"
    },
    "columns": ["id", "amount", "currency", "status", "created_at", "customer_id"]
  }'
```

### Response

```json
{
  "id": "export_abc123",
  "status": "processing",
  "resource": "orders",
  "format": "csv",
  "estimated_rows": 45000,
  "created_at": "2025-04-01T10:00:00Z"
}
```

## Supported Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| CSV | `.csv` | Comma-separated values, UTF-8 encoded |
| JSON | `.jsonl` | Newline-delimited JSON |
| Parquet | `.parquet` | Columnar format for analytics tools |

## Checking Export Status

```bash
curl https://api.acme.com/v1/exports/export_abc123 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "id": "export_abc123",
  "status": "completed",
  "resource": "orders",
  "format": "csv",
  "row_count": 43521,
  "file_size": 8945632,
  "download_url": "https://exports.acme.com/export_abc123.csv",
  "download_expires_at": "2025-04-02T10:00:00Z",
  "created_at": "2025-04-01T10:00:00Z",
  "completed_at": "2025-04-01T10:02:30Z"
}
```

## Downloading

Download URLs are signed and expire after 24 hours. Request a new URL if the original expires:

```bash
curl "https://exports.acme.com/export_abc123.csv" -o orders.csv
```

For large exports, the API splits results into multiple files:

```json
{
  "id": "export_abc123",
  "status": "completed",
  "files": [
    {"part": 1, "url": "https://exports.acme.com/export_abc123_part1.csv", "rows": 50000},
    {"part": 2, "url": "https://exports.acme.com/export_abc123_part2.csv", "rows": 43521}
  ]
}
```

## Exportable Resources

| Resource | Available Columns | Max Date Range |
|----------|-------------------|----------------|
| `orders` | id, amount, currency, status, customer_id, created_at, items | 1 year |
| `customers` | id, name, email, created_at, total_orders, lifetime_value | No limit |
| `products` | id, name, sku, price, category, inventory_count | No limit |
| `transactions` | id, amount, type, status, order_id, created_at | 90 days |
| `events` | id, type, resource_type, resource_id, timestamp, actor | 30 days |

## Scheduled Exports

Set up recurring exports that run automatically:

```python
import acme

client = acme.Client(api_key="YOUR_API_KEY")

schedule = client.exports.create_schedule(
    resource="orders",
    format="parquet",
    frequency="weekly",
    day_of_week="monday",
    filters={"status": "completed"},
    delivery={
        "type": "s3",
        "bucket": "my-analytics-bucket",
        "prefix": "acme-exports/orders/",
        "region": "us-east-1"
    }
)
```

### Delivery Destinations

| Destination | Configuration Required |
|-------------|----------------------|
| Download URL | None (default) |
| Amazon S3 | Bucket, prefix, region, IAM role ARN |
| Google Cloud Storage | Bucket, prefix, service account |
| Azure Blob Storage | Container, prefix, SAS token |
| SFTP | Host, port, path, credentials |
| Webhook | URL (POST with download links) |
