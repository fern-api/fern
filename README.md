<div align="center">
  <a href="https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern&utm_content=logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="/fern/images/logo-white.svg">
      <source media="(prefers-color-scheme: light)" srcset="/fern/images/logo-primary.svg">
      <img alt="Fern" src="/fern/images/logo-primary.svg" height="80" align="center">
    </picture>
  </a>

<br/>
<br/>

**Instant Docs and SDKs for your API**

[![Documentation](https://img.shields.io/badge/Read%20Docs-black?logo=book)](https://buildwithfern.com/learn?utm_source=fern-api/fern/readme)
[![Slack](https://img.shields.io/badge/Join%20Slack-pink?logo=slack)](https://buildwithfern.com/slack)
![License](https://img.shields.io/badge/License-Apache%202.0-blue)

</div>

---

Fern is a toolkit for building REST APIs. With Fern, you can generate SDKs, API documentation, and server boilerplate.

Fern is compatible with OpenAPI, and supports TypeScript, Python, Java, Go, Ruby, C#, and PHP.

## Quickstart

The Fern CLI runs on Node 18+. Install it globally:

```bash
npm install -g fern-api
```

### Generate SDKs

Initialize Fern with your OpenAPI spec:

```bash
fern init --openapi ./path/to/openapi.yml
```

Add a generator:

```bash
fern add fern-python-sdk
```

Generate your SDK:

```bash
fern generate
```

### Generate Docs

Initialize a docs project:

```bash
fern init --docs
```

Preview locally:

```bash
fern docs dev
```

Publish to a `*.docs.buildwithfern.com` URL:

```bash
fern generate --docs
```

## Customer Showcase

Fern is trusted by industry leaders to power their SDKs and documentation:

| Company | SDKs | Docs |
| --- | --- | --- |
| [ElevenLabs](https://elevenlabs.io) | [Python](https://pypi.org/project/elevenlabs/), [TypeScript](https://www.npmjs.com/package/elevenlabs) | [elevenlabs.io/docs](https://elevenlabs.io/docs) |
| [Square](https://squareup.com) | [Python](https://github.com/square/square-python-sdk), [TypeScript](https://github.com/square/square-nodejs-sdk), [Go](https://github.com/square/square-go-sdk), [Java](https://github.com/square/square-java-sdk), [C#](https://github.com/square/square-dotnet-sdk), [PHP](https://github.com/square/square-php-sdk) | [developer.squareup.com](https://developer.squareup.com/docs) |
| [Webflow](https://webflow.com) | [TypeScript](https://github.com/webflow/js-webflow-api) | [developers.webflow.com](https://developers.webflow.com) |
| [Cohere](https://cohere.com) | [Python](https://github.com/cohere-ai/cohere-python), [TypeScript](https://github.com/cohere-ai/cohere-typescript), [Go](https://github.com/cohere-ai/cohere-go), [Java](https://github.com/cohere-ai/cohere-java) | [docs.cohere.com](https://docs.cohere.com) |
| [Pinecone](https://pinecone.io) | [Python](https://github.com/pinecone-io/pinecone-python-client), [TypeScript](https://github.com/pinecone-io/pinecone-ts-client), [Go](https://github.com/pinecone-io/go-pinecone), [Java](https://github.com/pinecone-io/pinecone-java-client), [C#](https://github.com/pinecone-io/pinecone-dotnet-client) | [docs.pinecone.io](https://docs.pinecone.io) |

## Generators

Fern's generators take your API definition and output production-ready code. Add a generator with `fern add <generator>`.

**SDK Generators**: `fern-typescript-sdk`, `fern-python-sdk`, `fern-java-sdk`, `fern-go-sdk`, `fern-ruby-sdk`, `fern-csharp-sdk`, `fern-php-sdk`

**Server Generators**: `fern-typescript-express`, `fern-fastapi-server`, `fern-java-spring`

**Spec Generators**: `fern-openapi`, `fern-postman`

For a complete list of generators and configuration options, see the [generators documentation](https://buildwithfern.com/learn/sdks/overview/introduction).

## CLI Reference

| Command | Description |
| --- | --- |
| `fern init` | Initialize a new Fern project |
| `fern check` | Validate your API definition |
| `fern generate` | Run generators in the cloud |
| `fern generate --local` | Run generators locally with Docker |
| `fern add <generator>` | Add a generator to your project |
| `fern docs dev` | Preview docs locally |

For all CLI commands, see the [CLI reference](https://buildwithfern.com/learn/cli-api/cli-reference/commands).

## Community

Join the [Fern Slack](https://buildwithfern.com/slack) to connect with other developers and the Fern team.

## Contributing

We welcome contributions! See [CONTRIBUTING.md](/CONTRIBUTING.md) for guidelines.

![Fern Contributors](https://contrib.rocks/image?repo=fern-api/fern)
