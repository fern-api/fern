# Seed TypeScript Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FTypeScript)
[![npm shield](https://img.shields.io/npm/v/@fern/query-parameters)](https://www.npmjs.com/package/@fern/query-parameters)

The Seed TypeScript library provides convenient access to the Seed API from TypeScript.

## Installation

```sh
npm i -s @fern/query-parameters
```

## Reference

A full reference for this library is available [here](./reference.md).

## Usage

Instantiate and use the client with the following:

```typescript
import { SeedQueryParametersClient } from "@fern/query-parameters";

const client = new SeedQueryParametersClient({ environment: "YOUR_BASE_URL" });
await client.user.getUsername({
    limit: 1,
    id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    date: "2023-01-15",
    deadline: "2024-01-15T09:30:00Z",
    bytes: "SGVsbG8gd29ybGQh",
    user: {
        name: "name",
        tags: ["tags", "tags"],
    },
    userList: [
        {
            name: "name",
            tags: ["tags", "tags"],
        },
        {
            name: "name",
            tags: ["tags", "tags"],
        },
    ],
    optionalDeadline: "2024-01-15T09:30:00Z",
    keyValue: {
        keyValue: "keyValue",
    },
    optionalString: "optionalString",
    nestedUser: {
        name: "name",
        user: {
            name: "name",
            tags: ["tags", "tags"],
        },
    },
    optionalUser: {
        name: "name",
        tags: ["tags", "tags"],
    },
    excludeUser: {
        name: "name",
        tags: ["tags", "tags"],
    },
    filter: "filter",
});
```

## Request And Response Types

The SDK exports all request and response types as TypeScript interfaces. Simply import them with the
following namespace:

```typescript
import { SeedQueryParameters } from "@fern/query-parameters";

const request: SeedQueryParameters.GetUsersRequest = {
    ...
};
```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), a subclass of the following error
will be thrown.

```typescript
import { SeedQueryParametersError } from "@fern/query-parameters";

try {
    await client.user.getUsername(...);
} catch (err) {
    if (err instanceof SeedQueryParametersError) {
        console.log(err.statusCode);
        console.log(err.message);
        console.log(err.body);
        console.log(err.rawResponse);
    }
}
```

## Advanced

### Additional Headers

If you would like to send additional headers as part of the request, use the `headers` request option.

```typescript
const response = await client.user.getUsername(..., {
    headers: {
        'X-Custom-Header': 'custom value'
    }
});
```

### Retries

The SDK is instrumented with automatic retries with exponential backoff. A request will be retried as long
as the request is deemed retryable and the number of retry attempts has not grown larger than the configured
retry limit (default: 2).

A request is deemed retryable when any of the following HTTP status codes is returned:

- [408](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) (Timeout)
- [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (Too Many Requests)
- [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) (Internal Server Errors)

Use the `maxRetries` request option to configure this behavior.

```typescript
const response = await client.user.getUsername(..., {
    maxRetries: 0 // override maxRetries at the request level
});
```

### Timeouts

The SDK defaults to a 60 second timeout. Use the `timeoutInSeconds` option to configure this behavior.

```typescript
const response = await client.user.getUsername(..., {
    timeoutInSeconds: 30 // override timeout to 30s
});
```

### Aborting Requests

The SDK allows users to abort requests at any point by passing in an abort signal.

```typescript
const controller = new AbortController();
const response = await client.user.getUsername(..., {
    abortSignal: controller.signal
});
controller.abort(); // aborts the request
```

### Access Raw Response Data

The SDK provides access to raw response data, including headers, through the `.withRawResponse()` method.
The `.withRawResponse()` method returns a promise that results to an object with a `data` and a `rawResponse` property.

```typescript
const { data, rawResponse } = await client.user.getUsername(...).withRawResponse();

console.log(data);
console.log(rawResponse.headers['X-My-Header']);
```

### Runtime Compatibility

The SDK defaults to `node-fetch` but will use the global fetch client if present. The SDK works in the following
runtimes:

- Node.js 18+
- Vercel
- Cloudflare Workers
- Deno v1.25+
- Bun 1.0+
- React Native

### Customizing Fetch Client

The SDK provides a way for you to customize the underlying HTTP client / Fetch function. If you're running in an
unsupported environment, this provides a way for you to break glass and ensure the SDK works.

```typescript
import { SeedQueryParametersClient } from "@fern/query-parameters";

const client = new SeedQueryParametersClient({
    ...
    fetcher: // provide your implementation here
});
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!
