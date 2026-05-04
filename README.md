# SmokeTest TypeScript Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=https%3A%2F%2Fgithub.com%2Ffern-api%2Ffern)
[![npm shield](https://img.shields.io/npm/v/)](https://www.npmjs.com/package/)

The SmokeTest TypeScript library provides convenient access to the SmokeTest APIs from TypeScript.

## Table of Contents

-   [🌿 Sdks](#-sdks)
-   [🌿 Api Documentation](#-api-documentation)
-   [🌿 Generators](#-generators)
-   [🌿 Cli Commands](#-cli-commands)
-   [Inspiration](#inspiration)
-   [Community](#community)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Exception Handling](#exception-handling)
-   [Advanced](#advanced)
    -   [Retries](#retries)
    -   [Timeouts](#timeouts)
    -   [Aborting Requests](#aborting-requests)
    -   [Runtime Compatibility](#runtime-compatibility)
-   [Contributing](#contributing)

## 🌿 SDKs

The Fern platform is available via a command line interface (CLI) and requires Node 18+. To install it, run:

```bash
npm install -g fern-api
```

Initialize Fern with your OpenAPI spec:

```bash
fern init --openapi ./path/to/openapi.yml
# or
fern init --openapi https://link.buildwithfern.com/plantstore-openapi
```

Your directory should look like the following:

```yaml
fern/
├─ fern.config.json
├─ generators.yml # generators you're using
└─ openapi/
  └─ openapi.json # your openapi document
```

Finally, to invoke the generator, run:

```bash
fern generate
```

🎉 Once the command completes, you'll see your SDK in `/generated/sdks/typescript`.

## 🌿 API Documentation

Fern can also build and host a documentation website with an auto-generated API reference. Write additional pages in markdown and have them versioned with git.
Search, SEO, dark mode, and popular components are provided out-of-the-box. Plus, you can customize the colors, font, logo, and domain name.

Check out docs built with Fern:

-   [elevenlabs.io/docs](https://elevenlabs.io/docs)
-   [launchdarkly.com/docs](https://launchdarkly.com/docs/home)
-   [docs.hume.ai](https://docs.hume.ai/)

Get started [here](https://github.com/fern-api/docs-starter).

## 🌿 Generators

Generators are processes that take your API Definition as input and output artifacts (SDKs, Server boilerplate, etc.). To add a generator, run `fern add <generator id>`.

### SDK Generators

| Generator ID                  | Latest Version                                                                               | Changelog                                                                         |
| ----------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `fernapi/fern-typescript-sdk` | ![Typescript Generator Version](https://img.shields.io/docker/v/fernapi/fern-typescript-sdk) | [Changelog](https://buildwithfern.com/learn/sdks/generators/typescript/changelog) |
| `fernapi/fern-python-sdk`     | ![Python Generator Version](https://img.shields.io/docker/v/fernapi/fern-python-sdk)         | [Changelog](https://buildwithfern.com/learn/sdks/generators/python/changelog)     |
| `fernapi/fern-java-sdk`       | ![Java Generator Version](https://img.shields.io/docker/v/fernapi/fern-java-sdk)             | [Changelog](https://buildwithfern.com/learn/sdks/generators/java/changelog)       |
| `fernapi/fern-ruby-sdk`       | ![Ruby Generator Version](https://img.shields.io/docker/v/fernapi/fern-ruby-sdk)             | [Changelog](https://buildwithfern.com/learn/sdks/generators/ruby/changelog)       |
| `fernapi/fern-go-sdk`         | ![Go Generator Version](https://img.shields.io/docker/v/fernapi/fern-go-sdk)                 | [Changelog](https://buildwithfern.com/learn/sdks/generators/go/changelog)         |
| `fernapi/fern-csharp-sdk`     | ![C# Generator Version](https://img.shields.io/docker/v/fernapi/fern-csharp-sdk)             | [Changelog](https://buildwithfern.com/learn/sdks/generators/csharp/changelog)     |
| `fernapi/fern-php-sdk`        | ![PHP Generator Version](https://img.shields.io/docker/v/fernapi/fern-php-sdk)               | [Changelog](https://buildwithfern.com/learn/sdks/generators/php/changelog)        |
| `fernapi/fern-swift-sdk`      | ![Swift Generator Version](https://img.shields.io/docker/v/fernapi/fern-swift-sdk)           | [Changelog](https://buildwithfern.com/learn/sdks/generators/swift/changelog)      |
| `fernapi/fern-rust-sdk`       | ![Rust Generator Version](https://img.shields.io/docker/v/fernapi/fern-rust-sdk)             | [Changelog](https://buildwithfern.com/learn/sdks/generators/rust/changelog)       |

### Spec Generators

Fern's spec generators can output an OpenAPI spec.

> **Note**: The OpenAPI spec generator is primarily intended for Fern Definition users. This prevents lock-in so that one can always export to OpenAPI.

| Generator ID           | Latest Version                                                                     | Changelog                                         |
| ---------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------- |
| `fernapi/fern-openapi` | ![OpenAPI Generator Version](https://img.shields.io/docker/v/fernapi/fern-openapi) | [versions.yml](./generators/openapi/versions.yml) |

## 🌿 CLI Commands

Here's a quick look at the most popular CLI commands. View the documentation for [all CLI commands](https://buildwithfern.com/learn/cli-api/cli-reference/commands).

`fern init`: adds a new starter API to your repository.

`fern check`: validate your API definition and Fern configuration.

`fern generate`: run the generators specified in `generators.yml` in the cloud.

`fern generate --local`: run the generators specified in `generators.yml` in docker locally.

`fern add <generator>`: include a new generator in your `generators.yml`. For example, `fern add fern-python-sdk`.

## Inspiration

Fern is inspired by internal tooling built to enhance the developer experience. We stand on the shoulders of giants. While teams were responsible for building the following tools, we want to give a shout out to Mark Elliot (creator of Conjure at Palantir), Michael Dowling (creator of Smithy at AWS), and Ian McCrystal (creator of Stripe Docs).

## Community

[Join our Slack!](https://buildwithfern.com/slack) We are here to answer questions and help you get the most out of Fern.

## Installation

```sh
npm i -s
```

## Usage

Instantiate and use the client with the following:

```typescript
import { SmokeTestTestApiClient } from "";

const client = new SmokeTestTestApiClient({ environment: "YOUR_BASE_URL" });
await client.hello.sayHello();
```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), a subclass of the following error
will be thrown.

```typescript
import { SmokeTestTestApiError } from "SmokeTestTestApi";

try {
    await client.hello.sayHello(...);
} catch (err) {
    if (err instanceof SmokeTestTestApiError) {
        console.log(err.statusCode);
        console.log(err.message);
        console.log(err.body);
    }
}
```

## Advanced

### Retries

The SDK is instrumented with automatic retries with exponential backoff. A request will be retried as long
as the request is deemed retriable and the number of retry attempts has not grown larger than the configured
retry limit (default: 2).

A request is deemed retriable when any of the following HTTP status codes is returned:

-   [408](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) (Timeout)
-   [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (Too Many Requests)
-   [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) (Internal Server Errors)

Use the `maxRetries` request option to configure this behavior.

```typescript
const response = await client.hello.sayHello(..., {
    maxRetries: 0 // override maxRetries at the request level
});
```

### Timeouts

The SDK defaults to a 60 second timeout. Use the `timeoutInSeconds` option to configure this behavior.

```typescript
const response = await client.hello.sayHello(..., {
    timeoutInSeconds: 30 // override timeout to 30s
});
```

### Aborting Requests

The SDK allows users to abort requests at any point by passing in an abort signal.

```typescript
const controller = new AbortController();
const response = await client.hello.sayHello(..., {
    abortSignal: controller.signal
});
controller.abort(); // aborts the request
```

### Runtime Compatibility

The SDK defaults to `node-fetch` but will use the global fetch client if present. The SDK works in the following
runtimes:

-   Node.js 18+
-   Vercel
-   Cloudflare Workers
-   Deno v1.25+
-   Bun 1.0+
-   React Native

### Customizing Fetch Client

The SDK provides a way for your to customize the underlying HTTP client / Fetch function. If you're running in an
unsupported environment, this provides a way for you to break glass and ensure the SDK works.

```typescript
import { SmokeTestTestApiClient } from "SmokeTestTestApi";

const client = new SmokeTestTestApiClient({
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
