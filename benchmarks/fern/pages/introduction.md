---
title: Introduction
description: Learn about the ElevenLabs API platform and how to integrate text-to-speech, voice cloning, and audio AI into your applications.
slug: introduction
---

# Introduction

The ElevenLabs API platform provides a comprehensive suite of tools for building AI-powered audio applications. Whether you're generating lifelike speech, cloning voices, transcribing audio, or building conversational agents, the APIs offer the building blocks you need.

## Why ElevenLabs?

The platform is designed for:

- **Quality**: Industry-leading voice synthesis with natural intonation and emotional delivery
- **Low latency**: Sub-75ms streaming for real-time applications
- **Multilingual**: Support for 32+ languages with native-quality pronunciation
- **Scalability**: Handle millions of characters per day with enterprise-grade infrastructure

## Platform overview

The API platform consists of several interconnected services:

| Service | Description | Common use cases |
|---------|-------------|-----------------|
| Text to Speech | Convert text into lifelike spoken audio | Audiobooks, podcasts, accessibility |
| Speech to Text | Transcribe audio into accurate text | Meeting notes, subtitles, search indexing |
| Voice Cloning | Create custom voices from audio samples | Brand voices, personalization, dubbing |
| Voice Library | Browse and use pre-made voices | Prototyping, content creation |
| Sound Effects | Generate sound effects from text descriptions | Game audio, film production |
| Dubbing | Translate audio preserving speaker identity | Content localization, media |
| Voice Agents | Build conversational AI with natural voices | Customer support, virtual assistants |

## Getting started

To start building with the API:

1. Create an ElevenLabs account
2. Generate an API key in the Dashboard
3. Install the SDK for your programming language
4. Make your first API call

```bash
curl -X POST https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb \
  -H 'xi-api-key: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "Hello world! This is a test of the text to speech API.",
    "model_id": "eleven_flash_v2_5"
  }' \
  --output speech.mp3
```

The response is an audio file containing the generated speech.

## Next steps

- [Getting Started](/getting-started) - Set up your development environment
- [Authentication](/authentication) - Learn about API authentication
- [API Reference](/api-reference) - Explore the full API
