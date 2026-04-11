---
title: Environments
description: Understand ElevenLabs environments and data residency options for development and production.
slug: environments
---

# Environments

ElevenLabs provides options for managing your API usage across different environments and data residency requirements.

## API environments

| Feature | Standard | Enterprise |
|---------|----------|------------|
| Base URL | `api.elevenlabs.io` | Custom endpoint |
| Data residency | US (default) | US, EU, or custom |
| SLA | Best effort | 99.9% uptime |
| Rate limits | Plan-based | Custom |
| Zero retention | Per-request opt-in | Default enabled |
| Support | Community + email | Dedicated |

## Data residency

Enterprise customers can choose where their data is processed and stored:

| Region | Endpoint | Data center |
|--------|----------|-------------|
| United States | `api.elevenlabs.io` | US East |
| European Union | `api.eu.elevenlabs.io` | EU West |

### Configuring data residency

```typescript
const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
  baseUrl: "https://api.eu.elevenlabs.io", // EU data residency
});
```

```python
client = ElevenLabs(
    api_key=os.environ["ELEVENLABS_API_KEY"],
    base_url="https://api.eu.elevenlabs.io",
)
```

### Data isolation guarantees

- Audio data is processed and stored only in the selected region
- Voice clones and custom models are region-specific
- API keys work across regions but data does not transfer
- Webhook events are dispatched from the selected region

## Development workflow

### Local development

For local development, use your personal API key with standard rate limits:

```typescript
const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Use a test voice for development
const TEST_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"; // George (pre-made)
```

### Staging environment

For staging, use a separate workspace with its own API keys and quotas:

```typescript
const client = new ElevenLabsClient({
  apiKey: process.env.NODE_ENV === "production"
    ? process.env.ELEVENLABS_PROD_KEY
    : process.env.ELEVENLABS_STAGING_KEY,
});
```

## Production checklist

Before going live, ensure you've completed the following:

- [ ] Using service account API keys (not personal keys)
- [ ] Error handling covers all error categories
- [ ] Retry logic with exponential backoff is implemented
- [ ] Rate limiting is properly managed
- [ ] Character quota monitoring is in place
- [ ] Webhook signature verification is enabled
- [ ] Audio caching is configured for repeated requests
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
      ? process.env.ELEVENLABS_PROD_KEY!
      : process.env.ELEVENLABS_DEV_KEY!,
    baseUrl: isProd
      ? "https://api.eu.elevenlabs.io"
      : "https://api.elevenlabs.io",
    maxRetries: isProd ? 3 : 1,
    enableLogging: !isProd,
  };
}
```
