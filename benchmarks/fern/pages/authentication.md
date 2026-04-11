---
title: Authentication
description: Learn about Acme API authentication methods and best practices for securing your API keys.
slug: authentication
---

# Authentication

The Acme API uses API keys for authentication. Every request must include a valid API key to access the platform's capabilities.

## API keys

API keys are the primary way to authenticate with the Acme API. You can create and manage keys in the [Dashboard](https://acme.io/app/settings/api-keys).

Include your API key in the `Authorization` header:

```bash
curl https://api.acme.io/v1/resources \
  -H 'Authorization: Bearer YOUR_API_KEY'
```

### Key types

| Key type | Scope | Use case |
|----------|-------|----------|
| Personal API key | Full account access | Development, personal projects |
| Service account key | Workspace-scoped | Production applications, CI/CD |
| Scoped key | Limited permissions | Third-party integrations |

### Key security best practices

- Never expose API keys in client-side code or public repositories
- Store keys in environment variables or a secrets manager
- Rotate keys periodically and revoke unused ones
- Use service account keys for production workloads
- Use scoped keys with minimum required permissions for third-party integrations

## Using API keys with SDKs

```typescript
import { AcmeClient } from "@acme/acme-js";

const client = new AcmeClient({
  apiKey: process.env.ACME_API_KEY,
});
```

```python
from acme.client import Acme

client = Acme(
    api_key=os.environ["ACME_API_KEY"],
)
```

## Workspace authentication

For team environments, workspace-level authentication provides additional controls:

### Service accounts

Service accounts are non-human identities designed for automated workflows:

1. Navigate to **Workspace Settings > Service Accounts**
2. Create a new service account with a descriptive name
3. Assign the appropriate role (Admin, Editor, or Viewer)
4. Generate an API key for the service account

```typescript
// Service account key works the same as a personal key
const client = new AcmeClient({
  apiKey: process.env.ACME_SERVICE_ACCOUNT_KEY,
});
```

### Single Sign-On (SSO)

Enterprise workspaces can configure SSO for centralized access management:

- SAML 2.0 support for major identity providers (Okta, Azure AD, Google Workspace)
- Automatic user provisioning via SCIM
- Enforced SSO login for all workspace members

## Zero retention mode

For sensitive applications, enable zero retention mode by setting `enable_logging` to `false` on API requests. This ensures:

- No request data is stored on Acme servers
- History features are unavailable for the request
- Request tracing is disabled

```bash
curl -X POST https://api.acme.io/v1/data/process?enable_logging=false \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "input": "Sensitive content that should not be logged.",
    "pipeline": "standard_v2"
  }' \
  | jq .
```

## Rate limits by plan

| Plan | Requests per second | Concurrent requests |
|------|-------------------|-------------------|
| Free | 2 RPS | 2 |
| Starter | 5 RPS | 5 |
| Creator | 10 RPS | 10 |
| Pro | 20 RPS | 20 |
| Scale | 50 RPS | 50 |
| Enterprise | Custom | Custom |

See [Rate Limiting](/rate-limiting) for details on handling rate limit errors.
