---
title: How Fern works
---

Welcome to Fern! Use the schema-first API design process to simplify offering client SDKs and reference docs.

Step 1: [Describe your API](#1-describe-your-api)

Step 2: [Select code generators](#2-select-code-generators)

Step 3: [Publish your client SDKs and API docs](#3-publish)

Step 4: [Implement server interfaces](#4-implement-server-interaces-optional) (Optional)

Step 5: [Iterate on your API](#5-iterate)

### 1. Describe your API

We support OpenAPI and Swagger. Or use our no-code API builder _(in development)_.

### 2. Select code generators

**SDKs**: TypeScript, Java, Python, Ruby _(coming 2023)_, Go _(coming 2023)_
**OpenAPI**: Push your latest OpenAPI description to your docs provider.
**Postman**: Sync your latest Postman Collection to everyone in your workspace.

### 3. Publish

When you release your API, Github Actions take care of publishing your SDKs to a Github repo and registry (e.g. npm, Maven, PyPI).

### 4. Implement server interaces (optional)

Fern generates server interaces for your API. All you have to do is implement the business logic.

### 5. Iterate

As you improve your API, your client SDKs, API docs, and server stay in sync. Just release your API and Github Actions take care of the rest.

## What's next?

- [How do I get SDKs?](./features/sdk.md)
- [How do I get server interaces?](./features/server.md)
- [How do I sync API docs?](./features/api-docs.md)
- [How do I sync Postman?](./features/postman.md)
