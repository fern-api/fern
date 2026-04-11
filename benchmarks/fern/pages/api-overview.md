---
title: API Overview
description: Understand the core concepts and architecture of the ElevenLabs API platform.
slug: api-overview
---

# API Overview

The ElevenLabs API follows RESTful conventions and returns audio data or JSON depending on the endpoint. This page covers the fundamental concepts you'll encounter when working with the API.

## Base URL

All API requests are made to:

```
https://api.elevenlabs.io/v1
```

## Request format

All API requests must include:

- `xi-api-key` header with your API key
- `Content-Type: application/json` header for requests with a JSON body

```bash
curl -X POST https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb \
  -H 'xi-api-key: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "Hello, this is a test.",
    "model_id": "eleven_flash_v2_5",
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.75
    }
  }' \
  --output output.mp3
```

## Response formats

Responses vary by endpoint type:

| Endpoint type | Response format | Content-Type |
|--------------|----------------|--------------|
| Text to Speech | Audio binary | `audio/mpeg` |
| Speech to Text | JSON | `application/json` |
| Voices | JSON | `application/json` |
| Models | JSON | `application/json` |
| History | JSON or audio | Varies |

### JSON response example

```json
{
  "voices": [
    {
      "voice_id": "JBFqnCBsd6RMkjVDRZzb",
      "name": "George",
      "category": "premade",
      "labels": {
        "accent": "British",
        "age": "middle-aged",
        "gender": "male",
        "use_case": "narration"
      },
      "preview_url": "https://storage.elevenlabs.io/preview/JBFqnCBsd6RMkjVDRZzb.mp3"
    }
  ]
}
```

## Output formats

Text to Speech endpoints support multiple audio formats via the `output_format` query parameter:

| Format | Description | Quality | File size |
|--------|-------------|---------|-----------|
| `mp3_44100_128` | MP3 44.1kHz 128kbps | High | Medium |
| `mp3_44100_64` | MP3 44.1kHz 64kbps | Medium | Small |
| `mp3_22050_32` | MP3 22.05kHz 32kbps | Low | Smallest |
| `pcm_16000` | PCM 16kHz 16-bit | Lossless | Large |
| `pcm_22050` | PCM 22.05kHz 16-bit | Lossless | Larger |
| `pcm_24000` | PCM 24kHz 16-bit | Lossless | Larger |
| `pcm_44100` | PCM 44.1kHz 16-bit | Lossless | Largest |
| `ulaw_8000` | mu-law 8kHz | Phone | Tiny |

## Voice settings

Fine-tune voice output with these parameters:

```typescript
const voiceSettings = {
  stability: 0.5,        // 0.0 - 1.0: Lower = more expressive, higher = more consistent
  similarityBoost: 0.75, // 0.0 - 1.0: Higher = closer to original voice
  style: 0.0,            // 0.0 - 1.0: Style exaggeration (v2 models only)
  useSpeakerBoost: true,  // Enhance voice clarity
  speed: 1.0,            // 0.7 - 1.2: Playback speed adjustment
};
```

## Streaming

For real-time applications, use streaming endpoints that return audio chunks as they're generated:

```typescript
const audioStream = await client.textToSpeech.stream("JBFqnCBsd6RMkjVDRZzb", {
  text: "This text will be streamed as audio chunks.",
  modelId: "eleven_flash_v2_5",
  outputFormat: "mp3_44100_128",
});

for await (const chunk of audioStream) {
  // Process each audio chunk as it arrives
  process.stdout.write(chunk);
}
```

## Error responses

Error responses include a JSON object with details about what went wrong:

```json
{
  "detail": {
    "status": "invalid_api_key",
    "message": "The API key you provided is invalid. Please check your API key and try again."
  }
}
```

See [Error Handling](/error-handling) for details on error categories and codes.
