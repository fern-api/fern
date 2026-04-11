---
title: Error Handling
description: Handle Acme API errors gracefully with proper error categories, codes, and retry strategies.
slug: error-handling
---

# Error Handling

The Acme API returns structured error responses that help you diagnose and handle failures. This guide covers error categories, common error codes, and recommended retry strategies.

## Error response structure

All error responses follow a consistent format:

```json
{
  "detail": {
    "status": "invalid_api_key",
    "message": "The API key you provided is invalid. Please check your API key and try again."
  }
}
```

Some endpoints return additional context:

```json
{
  "detail": {
    "status": "quota_exceeded",
    "message": "You have exceeded your request quota for this billing period.",
    "quota": {
      "used": 100000,
      "limit": 100000,
      "remaining": 0,
      "reset_at": "2024-02-01T00:00:00Z"
    }
  }
}
```

## HTTP status codes

| Status | Meaning | Retryable? |
|--------|---------|------------|
| 200 | Success | N/A |
| 400 | Bad request (invalid parameters) | No (fix the request) |
| 401 | Unauthorized (invalid API key) | No (check credentials) |
| 403 | Forbidden (insufficient permissions) | No (upgrade plan or check scopes) |
| 404 | Resource not found | No (check resource ID) |
| 408 | Request timeout | Yes, with backoff |
| 422 | Unprocessable entity (validation error) | No (fix input) |
| 429 | Rate limited | Yes, after delay |
| 500 | Internal server error | Yes, with backoff |
| 503 | Service unavailable | Yes, with backoff |

## Common error codes

### Authentication errors

| Code | Description | Resolution |
|------|-------------|------------|
| `invalid_api_key` | API key is invalid or revoked | Check key in Dashboard |
| `api_key_missing` | No API key provided | Add `Authorization` header |
| `insufficient_permissions` | Key lacks required scope | Use a key with proper permissions |

### Quota and billing errors

| Code | Description | Resolution |
|------|-------------|------------|
| `quota_exceeded` | Request quota exhausted | Upgrade plan or wait for reset |
| `max_concurrent_requests` | Too many simultaneous requests | Queue requests |
| `resource_limit_reached` | Maximum resources created | Delete unused resources |
| `storage_limit_exceeded` | Storage quota reached | Upgrade plan |

### Input validation errors

| Code | Description | Resolution |
|------|-------------|------------|
| `input_too_large` | Input exceeds size limit | Split input into smaller chunks |
| `invalid_resource_id` | Resource ID does not exist | Check resource ID |
| `invalid_pipeline_id` | Pipeline ID not recognized | Check available pipelines |
| `invalid_output_format` | Unsupported output format | Use a supported format |
| `empty_input` | Input field is empty | Provide input content |

## Handling errors in code

```typescript
import { AcmeClient, AcmeError } from "@acme/acme-js";

async function processData(input: string, pipelineId: string) {
  try {
    const result = await client.data.process({
      input,
      pipeline: pipelineId,
    });
    return result;
  } catch (error) {
    if (error instanceof AcmeError) {
      const status = error.statusCode;

      switch (status) {
        case 429:
          // Rate limited - wait and retry
          await sleep(1000);
          return processData(input, pipelineId);
        case 401:
          // Invalid API key
          throw new AuthenticationError("Invalid API key");
        case 422:
          // Validation error - don't retry
          throw new ValidationError(error.message);
        case 500:
        case 503:
          // Server error - retry with backoff
          throw new RetryableError(error.message);
        default:
          throw error;
      }
    }
    throw error;
  }
}
```

## Retry strategy

For retryable errors, use exponential backoff with jitter:

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      if (error instanceof AcmeError) {
        const isRetryable = [408, 429, 500, 503].includes(error.statusCode);
        if (!isRetryable) throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * delay * 0.1;
      await sleep(delay + jitter);
    }
  }
  throw new Error("Unreachable");
}
```

## Best practices

1. **Always check status codes** before processing responses
2. **Implement retry logic** with exponential backoff for transient errors
3. **Handle quota errors gracefully** by informing users and suggesting plan upgrades
4. **Log error details** for debugging but never log API keys
5. **Set reasonable timeouts** to avoid hanging requests
