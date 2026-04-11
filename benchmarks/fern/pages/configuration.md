---
title: Configuration
description: Configure your ElevenLabs API integration with best practices for security and performance.
slug: configuration
---

# Configuration

This guide covers how to configure your ElevenLabs API integration for different environments, manage credentials securely, and optimize for performance.

## Client configuration

### TypeScript

```typescript
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
  timeout: 60000,
  maxRetries: 3,
});
```

### Python

```python
from elevenlabs.client import ElevenLabs

client = ElevenLabs(
    api_key=os.environ["ELEVENLABS_API_KEY"],
    timeout=60,
    max_retries=3,
)
```

### Go

```go
client := elevenlabs.NewClient(
    os.Getenv("ELEVENLABS_API_KEY"),
    elevenlabs.WithTimeout(60 * time.Second),
    elevenlabs.WithMaxRetries(3),
)
```

## Credential management

### Environment variables

Store credentials as environment variables, never in source code:

```bash
# .env (do NOT commit this file)
ELEVENLABS_API_KEY=xi-...
ELEVENLABS_WEBHOOK_SECRET=whsec-...
DEFAULT_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
DEFAULT_MODEL_ID=eleven_flash_v2_5
```

### Secrets managers

For production deployments, use a secrets manager:

| Provider | Service |
|----------|---------|
| AWS | Secrets Manager or Parameter Store |
| Google Cloud | Secret Manager |
| Azure | Key Vault |
| Hashicorp | Vault |
| Kubernetes | Secrets |

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

async function getApiKey(): Promise<string> {
  const smClient = new SecretsManagerClient({ region: "us-east-1" });
  const response = await smClient.send(
    new GetSecretValueCommand({ SecretId: "elevenlabs/api-key" })
  );
  return response.SecretString!;
}
```

## Voice configuration

Configure default voice settings for consistent output across your application:

```typescript
interface VoiceConfig {
  voiceId: string;
  modelId: string;
  voiceSettings: {
    stability: number;
    similarityBoost: number;
    style: number;
    useSpeakerBoost: boolean;
    speed: number;
  };
  outputFormat: string;
}

const defaultVoiceConfig: VoiceConfig = {
  voiceId: "JBFqnCBsd6RMkjVDRZzb",
  modelId: "eleven_flash_v2_5",
  voiceSettings: {
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.0,
    useSpeakerBoost: true,
    speed: 1.0,
  },
  outputFormat: "mp3_44100_128",
};
```

## Timeout configuration

Configure timeouts based on your use case:

| Operation | Recommended timeout |
|-----------|-------------------|
| Short text TTS (<500 chars) | 10-15 seconds |
| Long text TTS (>2000 chars) | 30-60 seconds |
| Streaming TTS | 120 seconds |
| Voice cloning | 120 seconds |
| Dubbing | 300 seconds |
| Speech to text | 60 seconds |

## Logging configuration

Enable request logging for debugging:

```typescript
const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Log requests in development
if (process.env.NODE_ENV !== "production") {
  console.log("ElevenLabs client initialized in development mode");
}
```

## Multi-workspace configuration

For applications managing multiple workspaces:

```typescript
interface WorkspaceConfig {
  workspaceId: string;
  apiKey: string;
  voiceIds: string[];
  quotaLimit: number;
}

class WorkspaceManager {
  private configs: Map<string, WorkspaceConfig> = new Map();

  async getClient(workspaceId: string): Promise<ElevenLabsClient> {
    const config = this.configs.get(workspaceId);

    if (!config) {
      throw new Error(`Unknown workspace: ${workspaceId}`);
    }

    return new ElevenLabsClient({
      apiKey: config.apiKey,
    });
  }
}
```

## Feature flags

Use feature flags to gradually roll out capabilities:

```typescript
interface FeatureFlags {
  enableStreaming: boolean;
  enableVoiceCloning: boolean;
  enableDubbing: boolean;
  maxCharactersPerRequest: number;
  defaultModel: string;
}

const defaultFlags: FeatureFlags = {
  enableStreaming: true,
  enableVoiceCloning: false,
  enableDubbing: false,
  maxCharactersPerRequest: 5000,
  defaultModel: "eleven_flash_v2_5",
};
```
