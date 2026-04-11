---
title: API Overview
description: Understand the core concepts and architecture of the Acme API platform.
slug: api-overview
---

# API Overview

The Acme API follows RESTful conventions and returns JSON responses. This page covers the fundamental concepts you'll encounter when working with the API.

## Base URL

All API requests are made to:

```
https://api.acme.io/v1
```

## Request format

All API requests must include:

- `Authorization` header with your API key
- `Content-Type: application/json` header for requests with a JSON body

```bash
curl -X POST https://api.acme.io/v1/data/process \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "input": "Hello, this is a test.",
    "pipeline": "standard_v2",
    "settings": {
      "quality": 0.5,
      "cacheEnabled": true
    }
  }' \
  | jq .
```

## Response formats

Responses vary by endpoint type:

| Endpoint type | Response format | Content-Type |
|--------------|----------------|--------------|
| Data Processing | JSON | `application/json` |
| File Download | Binary | `application/octet-stream` |
| Resources | JSON | `application/json` |
| Pipelines | JSON | `application/json` |
| History | JSON or CSV | Varies |

### JSON response example

```json
{
  "resources": [
    {
      "resource_id": "res_a1b2c3d4e5f6",
      "name": "production-db",
      "type": "database",
      "labels": {
        "region": "us-east-1",
        "tier": "standard",
        "environment": "production",
        "team": "backend"
      },
      "status_url": "https://api.acme.io/v1/resources/res_a1b2c3d4e5f6/status"
    }
  ]
}
```

## Output formats

Data processing endpoints support multiple output formats via the `output_format` query parameter:

| Format | Description | Quality | File size |
|--------|-------------|---------|-----------|
| `json` | Structured JSON output | Full fidelity | Medium |
| `json_compact` | Minified JSON | Full fidelity | Small |
| `csv` | Comma-separated values | Tabular only | Smallest |
| `parquet` | Apache Parquet columnar | Full fidelity | Compact |
| `ndjson` | Newline-delimited JSON | Full fidelity | Medium |
| `xml` | XML output | Full fidelity | Larger |
| `msgpack` | MessagePack binary | Full fidelity | Smallest |
| `arrow` | Apache Arrow IPC | Full fidelity | Compact |

## Processing settings

Fine-tune processing output with these parameters:

```typescript
const settings = {
  quality: 0.5,        // 0.0 - 1.0: Lower = faster, higher = more accurate
  cacheEnabled: true,  // Enable response caching
  dedup: true,         // Remove duplicate entries
  enrichMetadata: true, // Include additional metadata
  batchSize: 100,      // Items per processing batch
};
```

## Streaming

For real-time applications, use streaming endpoints that return results as they're generated:

```typescript
const stream = await client.data.stream({
  input: "This data will be streamed as it is processed.",
  pipeline: "standard_v2",
  outputFormat: "ndjson",
});

for await (const chunk of stream) {
  // Process each result chunk as it arrives
  console.log(JSON.parse(chunk));
}
```

## Error responses

Error responses include a JSON object with details about what went wrong:

```json
{
  "detail": {
    "status": "invalid_api_key",
    "message": "The API key you provided is invalid. Please check your API key and try again."
  }
}
```

See [Error Handling](/error-handling) for details on error categories and codes.
