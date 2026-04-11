---
title: Changelog
description: Recent updates, new features, and improvements to the ElevenLabs API.
slug: changelog
---

# Changelog

Stay up to date with the latest changes and improvements to the ElevenLabs API and SDKs.

## March 2025

### Eleven v3 model release

- **New model:** Eleven v3 now available with support for 70+ languages
- **Multi-speaker dialogue:** Generate conversations with speaker tags in a single request
- **Dramatic delivery:** Enhanced emotional range for performative and narrative content
- **Inline tags:** Use `[laughs]`, `[whispers]`, `[sarcastically]` for expressive output
- **Improved prosody:** More natural pacing, emphasis, and intonation across all languages

### SDK updates

- **TypeScript SDK v2.4.0:** Added v3 model support and multi-speaker helpers
- **Python SDK v1.8.0:** Added v3 model support and async streaming improvements

## February 2025

### Voice Agents API (General Availability)

- **Conversational AI:** Build real-time voice agents with sub-300ms latency
- **Tool calling:** Agents can invoke external tools and APIs during conversation
- **Custom knowledge bases:** Connect documents and URLs for agent grounding
- **Webhook events:** Receive notifications when agent calls start, end, or encounter errors

### API improvements

- **New endpoint:** `POST /v1/speech-to-text` for audio transcription
- **New parameter:** `speed` (0.7-1.3) for controlling speech rate in TTS
- **New output format:** `ulaw_8000` for telephony integrations

## January 2025

### Voice Library enhancements

- **Sharing controls:** Set voices as public, unlisted, or private
- **Usage analytics:** Track how often shared voices are used
- **Categories:** Browse voice library by accent, age, gender, and use case

### Platform updates

- **EU data residency:** Enterprise customers can now process data in EU regions
- **SSO support:** SAML-based single sign-on for Enterprise workspaces
- **Audit logs:** Track API key usage and administrative actions

## December 2024

### Flash v2.5 improvements

- **Lower latency:** Time-to-first-byte reduced by 30% compared to Flash v2
- **Better multilingual:** Improved accent handling for code-switched text
- **Higher throughput:** Increased concurrent request limits for all plans

### SDK updates

- **TypeScript SDK v2.3.0:** Added WebSocket streaming support
- **Python SDK v1.7.0:** Added async client and improved type hints
- **Go SDK v0.5.0:** Added streaming support and error type improvements

## November 2024

### Dubbing API (General Availability)

- **Automatic dubbing:** Translate and dub video/audio content into 29 languages
- **Voice preservation:** Maintain the original speaker's voice characteristics
- **Subtitle generation:** Automatic subtitle creation for dubbed content
- **Batch processing:** Queue multiple dubbing jobs via the API

### Pronunciation Dictionaries

- **Custom pronunciations:** Define how specific words and phrases should be pronounced
- **IPA and CMU support:** Use phonetic alphabets for precise pronunciation control
- **Per-voice dictionaries:** Apply different pronunciation rules to different voices
- **API management:** Full CRUD operations for dictionary entries

## October 2024

### Eleven Flash v2.5 release

- **New model:** Optimized for low-latency applications like real-time chat
- **~75ms latency:** Time-to-first-byte for short text inputs
- **32 languages:** Multilingual support with automatic language detection
- **50% cost reduction:** Lower character cost compared to Multilingual v2

### Sound Effects API

- **Text to sound effects:** Generate sound effects from text descriptions
- **Variable duration:** Control output length from 0.5 to 22 seconds
- **High quality:** 44.1kHz stereo output in MP3 or WAV format

## September 2024

### API versioning

- **Versioned endpoints:** All new endpoints follow `/v1/` versioning
- **Deprecation policy:** 6-month notice before removing deprecated endpoints
- **Migration guides:** Step-by-step guides for each breaking change

### Rate limiting improvements

- **Per-endpoint limits:** Different rate limits for different endpoint categories
- **Better headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` on all responses
- **Retry-After header:** Included on 429 responses with exact wait time
