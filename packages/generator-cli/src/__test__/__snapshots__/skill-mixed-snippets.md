---
name: acme-typescript-sdk
description: >-
  Use the Acme TypeScript SDK (`@acme/sdk`) to call the Acme API:
  installation, usage, errors.
  Use when writing TypeScript code that talks to Acme, or when a user asks how to
  do something with the Acme TypeScript SDK.
---

# Acme TypeScript SDK

## When to use this skill

Use this skill whenever the task involves calling the Acme API from TypeScript. Prefer the SDK over hand-written HTTP requests: it handles authentication, serialization, errors, retries and timeouts for you.

## Installation

```sh
npm i -s @acme/sdk
```

## Usage

This example demonstrates intermingling markdown and code snippets.

```typescript
const client = new AcmeClient({ apiKey: 'YOUR_API_KEY' });
```

You can also configure the client with additional options:

```typescript
const client = new AcmeClient({
  apiKey: 'YOUR_API_KEY',
  timeout: 30000,
  retries: 3
});
```

For Python users, the equivalent code is:

```python
client = AcmeClient(
    api_key='YOUR_API_KEY',
    timeout=30000,
    retries=3
)
```

## Errors

Handle errors gracefully.

```typescript
try {
  await client.users.get('user-id');
} catch (error) {
  if (error instanceof AcmeError) {
    console.error(error.message);
  }
}
```

> **Note:** All errors extend the base `AcmeError` class.

## Rules

- Read credentials from environment variables or a secrets manager; never hard-code API keys or tokens in source code.
- Use the typed request and response objects exported by the SDK instead of building raw JSON.
- Catch the SDK's typed errors and inspect the status code and body instead of matching on error messages.
- Do not edit generated SDK files; configure behavior through client options (base URL, headers, timeouts, retries).
- If a method or type is missing from this skill, look it up in the reference before falling back to raw HTTP.