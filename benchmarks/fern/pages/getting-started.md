---
title: Getting Started
description: Set up your development environment and make your first ElevenLabs API call.
slug: getting-started
---

# Getting Started

This guide walks you through setting up your development environment and making your first text-to-speech API call.

## Prerequisites

Before you begin, make sure you have:

- An ElevenLabs account ([sign up here](https://elevenlabs.io))
- An API key from the Dashboard
- A programming language environment (Node.js 18+, Python 3.8+, or similar)

## Install an SDK

Official SDKs are available for multiple languages:

```bash
# Node.js / TypeScript
npm install @elevenlabs/elevenlabs-js

# Python
pip install elevenlabs

# Go
go get github.com/elevenlabs/elevenlabs-go

# Ruby
gem install elevenlabs

# .NET
dotnet add package ElevenLabs

# PHP
composer require elevenlabs/elevenlabs-php
```

## Configure the client

Initialize the client with your API key:

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

## Make your first API call

Let's generate speech from text to verify the connection:

```typescript
import { play } from "@elevenlabs/elevenlabs-js";

async function generateSpeech() {
  const audio = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
    text: "The first move is what sets everything in motion.",
    modelId: "eleven_flash_v2_5",
    outputFormat: "mp3_44100_128",
  });

  await play(audio);
}

generateSpeech();
```

## Models

ElevenLabs offers several models optimized for different use cases:

| Model | Latency | Quality | Languages | Best for |
|-------|---------|---------|-----------|----------|
| Eleven v3 | Medium | Highest | 70+ | Dramatic, expressive content |
| Multilingual v2 | Medium | High | 29 | Long-form, consistent quality |
| Flash v2.5 | ~75ms | Good | 32 | Real-time, low-latency apps |
| English v1 | Low | Good | 1 | English-only applications |

## Voice options

You can use voices from several sources:

| Source | Description |
|--------|-------------|
| Pre-made voices | Curated voices ready to use immediately |
| Voice Library | Community-shared voices with diverse styles |
| Instant Clone | Clone a voice from a short audio sample |
| Professional Clone | High-fidelity clone from extended recordings |
| Voice Design | Generate a voice from a text description |

## Next steps

- [Authentication](/authentication) - Understand API key management
- [Text to Speech](/text-to-speech) - Deep dive into speech generation
- [API Reference](/api-reference) - Explore the complete API
