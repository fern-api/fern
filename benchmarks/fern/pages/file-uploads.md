---
title: File Uploads
slug: file-uploads
description: Upload files to the Acme API using multipart form data.
---

# File Uploads

Several Acme API endpoints accept file uploads via multipart form data. This guide covers how to upload files, size limits, and supported formats.

## Basic Upload

```bash
curl -X POST https://api.acme.com/v1/files \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@document.pdf" \
  -F "purpose=attachment"
```

The response includes a file object with a unique ID you can reference in subsequent API calls.

```json
{
  "id": "file_abc123",
  "filename": "document.pdf",
  "size": 245760,
  "content_type": "application/pdf",
  "purpose": "attachment",
  "created_at": "2025-03-15T10:30:00Z",
  "url": "https://files.acme.com/file_abc123"
}
```

## Size Limits

| Purpose | Max Size | Supported Types |
|---------|----------|-----------------|
| attachment | 25 MB | Any |
| avatar | 5 MB | PNG, JPG, WebP |
| import | 100 MB | CSV, JSON, XLSX |
| logo | 2 MB | PNG, SVG |

## Chunked Uploads

For files larger than 25 MB, use chunked uploads. This allows resumable uploads and better reliability on slow connections.

### Step 1: Initialize the Upload

```bash
curl -X POST https://api.acme.com/v1/uploads \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "large-dataset.csv",
    "total_bytes": 157286400,
    "purpose": "import"
  }'
```

### Step 2: Upload Chunks

```bash
curl -X PUT "https://api.acme.com/v1/uploads/upload_xyz/parts/1" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Range: bytes 0-10485759/157286400" \
  --data-binary @chunk1.bin
```

### Step 3: Complete the Upload

```bash
curl -X POST "https://api.acme.com/v1/uploads/upload_xyz/complete" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## SDK Examples

```python
import acme

client = acme.Client(api_key="YOUR_API_KEY")

# Simple upload
with open("document.pdf", "rb") as f:
    file = client.files.upload(
        file=f,
        purpose="attachment"
    )

print(f"Uploaded: {file.id}")

# Chunked upload for large files
upload = client.uploads.create(
    filename="large-dataset.csv",
    total_bytes=157286400,
    purpose="import"
)

with open("large-dataset.csv", "rb") as f:
    client.uploads.upload_parts(upload.id, f, chunk_size=10 * 1024 * 1024)

result = client.uploads.complete(upload.id)
```

## Downloading Files

Retrieve uploaded files using the file ID.

```bash
curl "https://api.acme.com/v1/files/file_abc123/content" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -o downloaded-file.pdf
```

## File Lifecycle

Files are retained based on their purpose:

- **attachment**: Retained for the lifetime of the parent resource
- **import**: Retained for 7 days after processing completes
- **avatar/logo**: Retained until replaced or the account is deleted

You can delete files explicitly using the `DELETE /v1/files/{id}` endpoint.
