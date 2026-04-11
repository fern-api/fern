---
title: SDKs
description: Official ElevenLabs SDKs for TypeScript, Python, and other languages.
slug: sdks
---

# SDKs

ElevenLabs provides official SDKs that wrap the REST API with idiomatic interfaces, type safety, and built-in error handling.

## Available SDKs

| Language | Package | Install |
|----------|---------|---------|
| TypeScript/Node.js | `@elevenlabs/elevenlabs-js` | `npm install @elevenlabs/elevenlabs-js` |
| Python | `elevenlabs` | `pip install elevenlabs` |
| Go | `elevenlabs-go` | `go get github.com/elevenlabs/elevenlabs-go` |
| Ruby | `elevenlabs` | `gem install elevenlabs` |
| .NET | `ElevenLabs` | `dotnet add package ElevenLabs` |
| PHP | `elevenlabs/elevenlabs-php` | `composer require elevenlabs/elevenlabs-php` |

## TypeScript SDK

The TypeScript SDK provides full type safety and works in Node.js 18+:

```typescript
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { play } from "@elevenlabs/elevenlabs-js";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Generate speech
const audio = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
  text: "Hello from the TypeScript SDK!",
  modelId: "eleven_flash_v2_5",
  outputFormat: "mp3_44100_128",
});

await play(audio);
```

## Python SDK

```python
from elevenlabs.client import ElevenLabs
from elevenlabs import play
import os

client = ElevenLabs(
    api_key=os.environ["ELEVENLABS_API_KEY"],
)

# Generate speech
audio = client.text_to_speech.convert(
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    text="Hello from the Python SDK!",
    model_id="eleven_flash_v2_5",
    output_format="mp3_44100_128",
)

play(audio)
```

## Go SDK

```go
package main

import (
    "context"
    "os"
    elevenlabs "github.com/elevenlabs/elevenlabs-go"
)

func main() {
    client := elevenlabs.NewClient(os.Getenv("ELEVENLABS_API_KEY"))

    audio, err := client.TextToSpeech.Convert(
        context.Background(),
        "JBFqnCBsd6RMkjVDRZzb",
        &elevenlabs.TextToSpeechRequest{
            Text:    "Hello from the Go SDK!",
            ModelID: "eleven_flash_v2_5",
        },
    )
    if err != nil {
        panic(err)
    }

    os.WriteFile("output.mp3", audio, 0644)
}
```

## SDK features

All official SDKs include:

- **Type safety** - Request and response types are fully typed
- **Automatic serialization** - Objects are serialized/deserialized automatically
- **Error handling** - Structured error types with detailed messages
- **Streaming support** - Built-in support for audio streaming responses
- **Retry logic** - Automatic retries for transient errors with exponential backoff
- **Audio playback** - Helper utilities for playing generated audio

## SDK configuration

| Option | Description | Default |
|--------|-------------|---------|
| `apiKey` | API key for authentication | Required |
| `timeout` | Request timeout in milliseconds | 60000 |
| `maxRetries` | Maximum number of retry attempts | 3 |
| `baseUrl` | Custom base URL | `https://api.elevenlabs.io` |

## Community SDKs

In addition to official SDKs, community-maintained SDKs are available for:

- Rust
- Swift
- Kotlin
- Elixir
- Dart/Flutter

These are not officially supported but may be useful for projects in those languages.
