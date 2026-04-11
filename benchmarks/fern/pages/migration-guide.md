---
title: Migration Guide
description: Migrate your ElevenLabs API integration between versions with minimal disruption.
slug: migration-guide
---

# Migration Guide

This guide helps you migrate your ElevenLabs API integration between SDK and model versions.

## Model version history

| Model | Release | Status |
|-------|---------|--------|
| Eleven v3 | March 2025 | Current (latest) |
| Eleven Flash v2.5 | October 2024 | Current |
| Eleven Multilingual v2 | June 2024 | Current |
| Eleven English v2 | January 2024 | Deprecated |
| Eleven Multilingual v1 | August 2023 | End of life |
| Eleven English v1 | January 2023 | End of life |

## Migrating to Eleven v3

### Key changes

#### 1. Expanded language support

Eleven v3 supports 70+ languages compared to 29 in Multilingual v2:

```typescript
// Before (Multilingual v2)
const audio = await client.textToSpeech.convert(voiceId, {
  text: "Hello world",
  modelId: "eleven_multilingual_v2",
});

// After (v3)
const audio = await client.textToSpeech.convert(voiceId, {
  text: "Hello world",
  modelId: "eleven_v3",
});
```

#### 2. Natural multi-speaker dialogue

v3 introduces support for multi-speaker dialogue in a single request:

```typescript
const audio = await client.textToSpeech.convert(voiceId, {
  text: `
    [Speaker 1]: Welcome to the show!
    [Speaker 2]: Thanks for having me.
    [Speaker 1]: Let's dive right in.
  `,
  modelId: "eleven_v3",
});
```

#### 3. Character limit changes

| Model | Character limit |
|-------|----------------|
| Eleven v3 | 5,000 |
| Multilingual v2 | 10,000 |
| Flash v2.5 | 40,000 |

For texts longer than the limit, split into chunks and concatenate the audio.

### New features in v3

- **Dramatic delivery** - Enhanced emotional range for performative content
- **Better prosody** - More natural pacing, emphasis, and intonation
- **Tag support** - Inline tags like `[laughs]`, `[whispers]`, `[sarcastically]`
- **Improved multilingual** - Better accent handling across language pairs

## SDK migration

### TypeScript SDK v1.x to v2.x

```typescript
// Before (v1.x)
import { ElevenLabsClient } from "elevenlabs";
const client = new ElevenLabsClient({ apiKey: "..." });

// After (v2.x)
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
const client = new ElevenLabsClient({ apiKey: "..." });
```

### Python SDK v0.x to v1.x

```python
# Before (v0.x)
from elevenlabs import generate, play
audio = generate(text="Hello", voice="George")

# After (v1.x)
from elevenlabs.client import ElevenLabs
from elevenlabs import play
client = ElevenLabs(api_key="...")
audio = client.text_to_speech.convert(
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    text="Hello",
    model_id="eleven_flash_v2_5",
)
```

## General migration steps

1. **Read the changelog** for your target version
2. **Update your SDK** to the latest version
3. **Update model IDs** in your configuration
4. **Test with sample inputs** to verify output quality
5. **Run your test suite** to catch breaking changes
6. **Monitor production** for errors after deployment
7. **Update documentation** to reflect new capabilities

## Backward compatibility

Non-breaking changes are added without version bumps:

- New optional fields in request/response objects
- New voice settings parameters
- New output format options
- New webhook event types

You do not need to update your code for non-breaking changes, but you should handle unknown fields gracefully.
