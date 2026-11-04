---
name: imdb-inc-typescript-sdk
description: >-
  Use the IMDB Inc TypeScript SDK to call the IMDB Inc API:
  installation, nonadvanced, advanced.
  Use when writing TypeScript code that talks to IMDB Inc, or when a user asks how to
  do something with the IMDB Inc TypeScript SDK.
---

# IMDB Inc TypeScript SDK

This is a test introduction. Custom override.

## When to use this skill

Use this skill whenever the task involves calling the IMDB Inc API from TypeScript. Prefer the SDK over hand-written HTTP requests: it handles authentication, serialization, errors, retries and timeouts for you.

## NonAdvanced

This is a non advanced feature

## Advanced

This is an advanced feature

## Rules

- Read credentials from environment variables or a secrets manager; never hard-code API keys or tokens in source code.
- Use the typed request and response objects exported by the SDK instead of building raw JSON.
- Catch the SDK's typed errors and inspect the status code and body instead of matching on error messages.
- Do not edit generated SDK files; configure behavior through client options (base URL, headers, timeouts, retries).
- If a method or type is missing from this skill, look it up in the reference before falling back to raw HTTP.