# Acme TypeScript Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Acme%2FTypeScript)
[![npm shield](https://img.shields.io/npm/v/@acme/sdk)](https://www.npmjs.com/package/@acme/sdk)

The Acme TypeScript library provides convenient access to the Acme APIs from TypeScript.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Errors](#errors)
- [Contributing](#contributing)

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

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!