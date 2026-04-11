---
title: Environments
description: Understand Acme environments and data residency options for development and production.
slug: environments
---

# Environments

Acme provides options for managing your API usage across different environments and data residency requirements.

## API environments

| Feature | Standard | Enterprise |
|---------|----------|------------|
| Base URL | `api.acme.io` | Custom endpoint |
| Data residency | US (default) | US, EU, or custom |
| SLA | Best effort | 99.9% uptime |
| Rate limits | Plan-based | Custom |
| Zero retention | Per-request opt-in | Default enabled |
| Support | Community + email | Dedicated |

## Data residency

Enterprise customers can choose where their data is processed and stored:

| Region | Endpoint | Data center |
|--------|----------|-------------|
| United States | `api.acme.io` | US East |
| European Union | `api.eu.acme.io` | EU West |

### Configuring data residency

```typescript
const client = new AcmeClient({
  apiKey: process.env.ACME_API_KEY,
  baseUrl: "https://api.eu.acme.io", // EU data residency
});
```

```python
client = Acme(
    api_key=os.environ["ACME_API_KEY"],
    base_url="https://api.eu.acme.io",
)
```

### Data isolation guarantees

- All data is processed and stored only in the selected region
- Custom pipelines and models are region-specific
- API keys work across regions but data does not transfer
- Webhook events are dispatched from the selected region

## Development workflow

### Local development

For local development, use your personal API key with standard rate limits:

```typescript
const client = new AcmeClient({
  apiKey: process.env.ACME_API_KEY,
});

// Use a test resource for development
const TEST_RESOURCE_ID = "res_a1b2c3d4e5f6"; // Sandbox resource
```

### Staging environment

For staging, use a separate workspace with its own API keys and quotas:

```typescript
const client = new AcmeClient({
  apiKey: process.env.NODE_ENV === "production"
    ? process.env.ACME_PROD_KEY
    : process.env.ACME_STAGING_KEY,
});
```

## Production checklist

Before going live, ensure you've completed the following:

- [ ] Using service account API keys (not personal keys)
- [ ] Error handling covers all error categories
- [ ] Retry logic with exponential backoff is implemented
- [ ] Rate limiting is properly managed
- [ ] Request quota monitoring is in place
- [ ] Webhook signature verification is enabled
- [ ] Response caching is configured for repeated requests
- [ ] Data residency requirements are met
- [ ] Zero retention mode is enabled if required

## Environment-specific configuration

Use environment variables to manage configuration:

```typescript
interface Config {
  apiKey: string;
  baseUrl: string;
  maxRetries: number;
  enableLogging: boolean;
}

function getConfig(): Config {
  const isProd = process.env.NODE_ENV === "production";

  return {
    apiKey: isProd
      ? process.env.ACME_PROD_KEY!
      : process.env.ACME_DEV_KEY!,
    baseUrl: isProd
      ? "https://api.eu.acme.io"
      : "https://api.acme.io",
    maxRetries: isProd ? 3 : 1,
    enableLogging: !isProd,
  };
}
```
