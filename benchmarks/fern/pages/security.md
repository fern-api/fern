---
title: Security
slug: security
description: Security best practices and features for protecting your integration.
---

# Security

This guide covers the security features available in the Acme API and best practices for building secure integrations.

## Transport Security

All API requests must be made over HTTPS. Requests over plain HTTP are rejected with a `301 Redirect` to the HTTPS endpoint. The API supports TLS 1.2 and TLS 1.3.

## API Key Security

### Key Types

| Prefix | Type | Use Case |
|--------|------|----------|
| `sk_live_` | Live secret key | Server-side production requests |
| `sk_test_` | Test secret key | Sandbox/development |
| `pk_live_` | Live publishable key | Client-side (limited access) |
| `pk_test_` | Test publishable key | Client-side sandbox |

### Key Rotation

Rotate API keys without downtime by creating a new key before revoking the old one:

```python
import acme

client = acme.Client(api_key="YOUR_API_KEY")

# Create a new key
new_key = client.api_keys.create(
    name="Production Key v2",
    scopes=["orders:read", "orders:write"]
)

# Deploy the new key to your application...

# Revoke the old key
client.api_keys.revoke("key_old_abc123")
```

### Leaked Key Detection

The Acme API integrates with GitHub's secret scanning. If a live API key is committed to a public repository, it is automatically revoked and you are notified via email.

## Webhook Verification

Verify that webhook events are genuinely from Acme by checking the signature:

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)

# In your webhook handler
is_valid = verify_webhook(
    payload=request.body,
    signature=request.headers["Acme-Signature"],
    secret="whsec_your_webhook_secret"
)
```

## Content Security

### Request Signing

For high-value operations, enable request signing to ensure requests have not been tampered with in transit:

```bash
curl -X POST https://api.acme.com/v1/transfers \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Acme-Signature: sha256=abc123..." \
  -H "Acme-Timestamp: 1710500000" \
  -d '{"amount": 50000, "destination": "acct_xyz"}'
```

### Input Validation

The API validates all inputs and returns descriptive errors for invalid data:

- String fields are sanitized to prevent injection attacks
- Numeric fields enforce range limits
- File uploads are scanned for malware
- URLs are validated and restricted to allowed protocols (http, https)

## Compliance

### Data Residency

Choose where your data is stored:

| Region | Location | Endpoint |
|--------|----------|----------|
| US | Virginia, USA | `https://api.acme.com` |
| EU | Frankfurt, Germany | `https://api.eu.acme.com` |
| APAC | Tokyo, Japan | `https://api.ap.acme.com` |

### GDPR

The API supports GDPR compliance with:

- **Data export**: Export all data for a customer using the data export API
- **Right to deletion**: Delete all customer data with a single API call
- **Consent tracking**: Record and query consent status per customer
- **Data processing agreements**: Available on request for Enterprise plans

```bash
# Delete all data for a customer (GDPR right to erasure)
curl -X POST "https://api.acme.com/v1/customers/cust_123/gdpr-delete" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### SOC 2

Acme is SOC 2 Type II certified. Audit reports are available on request for Enterprise customers.

## Security Headers

All API responses include security headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-Request-Id: req_abc123
```

Use the `X-Request-Id` header when reporting security issues for faster investigation.
