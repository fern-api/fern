---
title: Authentication
description: Learn about ElevenLabs API authentication methods and best practices for securing your API keys.
slug: authentication
---

# Authentication

The ElevenLabs API uses API keys for authentication. Every request must include a valid API key to access the platform's capabilities.

## API keys

API keys are the primary way to authenticate with the ElevenLabs API. You can create and manage keys in the [Dashboard](https://elevenlabs.io/app/settings/api-keys).

Include your API key in the `xi-api-key` header:

```bash
curl https://api.elevenlabs.io/v1/voices \
  -H 'xi-api-key: YOUR_API_KEY'
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
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});
```

```python
from elevenlabs.client import ElevenLabs

client = ElevenLabs(
    api_key=os.environ["ELEVENLABS_API_KEY"],
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
const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_SERVICE_ACCOUNT_KEY,
});
```

### Single Sign-On (SSO)

Enterprise workspaces can configure SSO for centralized access management:

- SAML 2.0 support for major identity providers (Okta, Azure AD, Google Workspace)
- Automatic user provisioning via SCIM
- Enforced SSO login for all workspace members

## Zero retention mode

For sensitive applications, enable zero retention mode by setting `enable_logging` to `false` on API requests. This ensures:

- No request data is stored on ElevenLabs servers
- History features are unavailable for the request
- Request stitching is disabled

```bash
curl -X POST https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb?enable_logging=false \
  -H 'xi-api-key: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "Sensitive content that should not be logged.",
    "model_id": "eleven_flash_v2_5"
  }' \
  --output speech.mp3
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
