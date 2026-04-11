---
title: Error Codes Reference
slug: error-codes
description: Complete reference of all API error codes and their meanings.
---

# Error Codes Reference

This page lists all error codes returned by the Acme API, their meanings, and suggested resolutions.

## HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request succeeded, no response body |
| 304 | Not Modified | Resource unchanged (conditional GET) |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 412 | Precondition Failed | ETag mismatch |
| 422 | Unprocessable Entity | Valid syntax but semantic errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 502 | Bad Gateway | Upstream service unavailable |
| 503 | Service Unavailable | Temporary maintenance |

## Error Response Format

```json
{
  "error": {
    "type": "invalid_request_error",
    "code": "parameter_invalid",
    "message": "The 'amount' parameter must be a positive integer.",
    "param": "amount",
    "doc_url": "https://docs.acme.com/errors/parameter_invalid",
    "request_id": "req_abc123"
  }
}
```

## Error Types

### `invalid_request_error`

The request was malformed or contained invalid parameters.

| Code | Description | Resolution |
|------|-------------|------------|
| `parameter_missing` | A required parameter was not provided | Include all required parameters |
| `parameter_invalid` | A parameter value is invalid | Check parameter types and ranges |
| `parameter_unknown` | An unrecognized parameter was sent | Remove unknown parameters |
| `body_invalid` | Request body could not be parsed | Verify JSON syntax |
| `idempotency_conflict` | Idempotency key reused with different params | Use a new idempotency key |

### `authentication_error`

The request could not be authenticated.

| Code | Description | Resolution |
|------|-------------|------------|
| `api_key_invalid` | The API key is not valid | Check your API key |
| `api_key_expired` | The API key has expired | Generate a new key |
| `api_key_revoked` | The API key was revoked | Generate a new key |
| `token_expired` | OAuth access token expired | Refresh the token |
| `scope_insufficient` | Token lacks required scope | Request additional scopes |

### `rate_limit_error`

Too many requests were made in a given time period.

| Code | Description | Resolution |
|------|-------------|------------|
| `rate_limit_exceeded` | Global rate limit hit | Implement backoff and retry |
| `concurrent_limit` | Too many concurrent requests | Reduce parallelism |
| `daily_limit_exceeded` | Daily request quota exhausted | Upgrade plan or wait |

### `resource_error`

An issue with the requested resource.

| Code | Description | Resolution |
|------|-------------|------------|
| `resource_not_found` | Resource does not exist | Verify the resource ID |
| `resource_already_exists` | Duplicate resource | Use a unique identifier |
| `resource_locked` | Resource is being modified | Retry after a delay |
| `resource_archived` | Resource has been archived | Restore or use a different resource |
| `resource_limit_reached` | Maximum resources exceeded | Delete unused resources or upgrade |

### `payment_error`

A payment-related operation failed.

| Code | Description | Resolution |
|------|-------------|------------|
| `insufficient_funds` | Not enough balance | Use a different payment method |
| `card_declined` | Card issuer declined | Contact card issuer or use another card |
| `expired_card` | Card has expired | Update payment method |
| `processing_error` | Payment processor issue | Retry after a delay |

## Handling Errors in SDKs

```python
import acme

client = acme.Client(api_key="YOUR_API_KEY")

try:
    order = client.orders.create(amount=-100)
except acme.InvalidRequestError as e:
    print(f"Invalid request: {e.code} - {e.message}")
    print(f"Parameter: {e.param}")
except acme.AuthenticationError as e:
    print(f"Auth failed: {e.message}")
except acme.RateLimitError as e:
    print(f"Rate limited. Retry after {e.retry_after}s")
except acme.APIError as e:
    print(f"Server error: {e.message}")
    print(f"Request ID: {e.request_id}")
```
