---
name: imdb-typescript-sdk
description: >-
  Use the Imdb TypeScript SDK to call the Imdb API:
  installation.
  Use when writing TypeScript code that talks to Imdb, or when a user asks how to
  do something with the Imdb TypeScript SDK.
---

# Imdb TypeScript SDK

## When to use this skill

Use this skill whenever the task involves calling the Imdb API from TypeScript. Prefer the SDK over hand-written HTTP requests: it handles authentication, serialization, errors, retries and timeouts for you.

## Resources

- Full list of clients, methods, parameters and return types for this SDK: [./reference.md](../../../reference.md). Read it before guessing a method name.

## Rules

- Read credentials from environment variables or a secrets manager; never hard-code API keys or tokens in source code.
- Use the typed request and response objects exported by the SDK instead of building raw JSON.
- Catch the SDK's typed errors and inspect the status code and body instead of matching on error messages.
- Do not edit generated SDK files; configure behavior through client options (base URL, headers, timeouts, retries).
- If a method or type is missing from this skill, look it up in the reference before falling back to raw HTTP.