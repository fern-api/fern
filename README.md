<br/>
<div align="center">
  <a href="https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern&utm_content=logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="/fern/images/logo-white.svg">
      <source media="(prefers-color-scheme: light)" srcset="/fern/images/logo-primary.svg">
      <img alt="logo" src="/fern/images/logo-primary.svg" height="80" align="center">
    </picture>
  </a>
<br/>

<br/>

[![2023 Y Combinator Startup](https://img.shields.io/badge/Y%20Combinator-2023-orange)](https://www.ycombinator.com/companies/fern)
![License](https://img.shields.io/badge/license-Apache%202.0-blue)

[![Slack](https://img.shields.io/badge/slack-pink.svg)](https://join.slack.com/t/fern-community/shared_invite/zt-2dpftfmif-MuAegl8AfP_PK8s2tx350Q)
[![Documentation](https://img.shields.io/badge/Read%20our%20Documentation-black?logo=book)](https://buildwithfern.com/learn/home?utm_source=fern-api/fern/readme-read-our-documentation)

</div>

# Instant Docs and SDKs for your API

Fern helps API providers deliver exceptional developer experiences by generating language-native SDKs and beautiful, interactive API documentation from your API specification.

<div align="center">
    <a href="/fern/images/overview-dark.png" target="_blank">
        <picture>
            <source srcset="/fern/images/overview-dark.png" media="(prefers-color-scheme: dark)">
            <source srcset="/fern/images/overview-light.png" media="(prefers-color-scheme: light)">
            <img src="/fern/images/overview-light.png" width="700" alt="Overview Diagram">
        </picture>
    </a>
</div>

## Why Fern?

Fern helps you:

- **Generate language-native SDKs** that respect idioms of each language, with strong types, inlined docs, and intuitive error handling
- **Create beautiful API documentation** tailored to your brand with guides, API reference, and interactive API explorer
- **Maintain consistency** between your API implementation, documentation, and client libraries
- **Focus on your core product** while Fern handles the developer experience

Trusted by companies like Square, Webflow, Intercom, Pinecone, Cohere, LaunchDarkly, and many more.

## 🚀 Quick Start

### SDK Generation

```bash
# Install the Fern CLI
npm install -g fern-api

# Initialize Fern with your OpenAPI spec
fern init --openapi ./path/to/openapi.yml
# or
fern init --openapi https://link.buildwithfern.com/plantstore-openapi

# Generate SDKs
fern generate
```

🎉 Once the command completes, you'll see your SDK in `/generated/sdks/typescript`.

### API Documentation

Fern builds and hosts documentation websites with auto-generated API references. Write additional pages in markdown and have them versioned with git. Search, SEO, dark mode, and popular components are provided out-of-the-box.

Check out docs built with Fern:
- [docs.cohere.com](https://docs.cohere.com)
- [launchdarkly.com/docs/home](https://launchdarkly.com/docs/home)
- [docs.cartesia.ai](https://docs.cartesia.ai/get-started/overview)
- [docs.letta.com](https://docs.letta.com/)

Get started [here](https://github.com/fern-api/docs-starter-openapi).

## 🌿 SDK Features

> "We evaluated several SDK generators and Fern stood out for its clean, language-native, and thoughtfully architected code. The Fern team partnered with us every step of the way."
> 
> — **Jon Fellman**, Head of Engineering, Developer Platform at Square

- **Language-native design**: Every SDK respects the idioms of the language
- **OAuth 2.0 support**: Seamless authentication with automatic token management
- **Server-sent events**: Stream real-time updates effortlessly
- **Auto pagination**: Automatically iterate through paginated data
- **Polymorphism (Unions)**: Handle complex polymorphic data with native type safety
- **Retries with exponential backoff**: Maximize the uptime of your API
- **Multipart form uploads**: Handle file uploads with built-in utilities
- **Automatic updates via CI/CD**: Generate SDKs as part of your release process

## 🌿 Docs Features

> "We partnered with Fern for SDKs, and after seeing their docs platform, it was a no-brainer to expand."
> 
> — **Vic Plummer**, Dev Content Lead at Webflow

- **Docs as code**: Version and release changes to your documentation with git
- **SEO optimized**: Fast and optimized to rank in search results
- **Preview deployments**: Preview changes with unique URLs for each pull request
- **API key injection**: Let users instantly make API calls with their own keys
- **Access control (RBAC)**: Configure what content users can access
- **Versioning**: Support users across different API versions
- **WebSockets documentation**: Document and interact with WebSocket connections
- **AI chat**: Add an AI assistant trained on your docs, API, and SDKs
- **Customization**: Extend with JavaScript, CSS, and custom React components

## 🌿 Supported Languages

Fern generates SDKs for:

| Language   | Status      |
|------------|-------------|
| TypeScript | ✅ Available |
| Python     | ✅ Available |
| Go         | ✅ Available |
| Java       | ✅ Available |
| C#         | ✅ Available |
| PHP        | ✅ Available |
| Ruby       | ✅ Available |
| Swift      | 🔜 Coming soon |
| Rust       | 🔜 Coming soon |

## 🌿 CLI Commands

Here's a quick look at the most popular CLI commands:

- `fern init`: adds a new starter API to your repository
- `fern check`: validate your API definition and Fern configuration
- `fern generate`: run the generators specified in `generators.yml` in the cloud
- `fern generate --local`: run the generators specified in `generators.yml` in docker locally
- `fern add <generator>`: include a new generator in your `generators.yml` (e.g., `fern add fern-python-sdk`)

View the documentation for [all CLI commands](https://buildwithfern.com/learn/cli-api/cli-reference/commands).

## 🌿 Generators

Fern offers various generators that take your API Definition as input and output artifacts. To add a generator, run `fern add <generator id>`.

### SDK Generators

| Generator ID                       | Latest Version                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| `fernapi/fern-typescript-node-sdk` | ![Typescript Generator Version](https://img.shields.io/docker/v/fernapi/fern-typescript-node-sdk) |
| `fernapi/fern-python-sdk`          | ![Python Generator Version](https://img.shields.io/docker/v/fernapi/fern-python-sdk)              |
| `fernapi/fern-java-sdk`            | ![Java Generator Version](https://img.shields.io/docker/v/fernapi/fern-java-sdk)                  |
| `fernapi/fern-ruby-sdk`            | ![Ruby Generator Version](https://img.shields.io/docker/v/fernapi/fern-ruby-sdk)                  |
| `fernapi/fern-go-sdk`              | ![Go Generator Version](https://img.shields.io/docker/v/fernapi/fern-go-sdk)                      |
| `fernapi/fern-csharp-sdk`          | ![C# Generator Version](https://img.shields.io/docker/v/fernapi/fern-csharp-sdk)                  |
| `fernapi/fern-php-sdk`             | ![PHP Generator Version](https://img.shields.io/docker/v/fernapi/fern-php-sdk)                    |

### Server-side Generators

Generate boilerplate application code for spec-first or API-first development:

| Generator ID                      | Latest Version                                                                                                  |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `fernapi/fern-typescript-express` | ![Typescript Express Server Generator Version](https://img.shields.io/docker/v/fernapi/fern-typescript-express) |
| `fernapi/fern-fastapi-server`     | ![Python FastAPI Server Generator Version](https://img.shields.io/docker/v/fernapi/fern-fastapi-server)         |
| `fernapi/fern-java-spring`        | ![Java Spring Server Generator Version](https://img.shields.io/docker/v/fernapi/fern-java-spring)               |

### Model Generators

Output schemas or types defined in your API spec:

| Generator ID                  | Latest Version                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| `fernapi/fern-pydantic-model` | ![Pydantic Model Generator Version](https://img.shields.io/docker/v/fernapi/fern-pydantic-model) |
| `fernapi/java-model`          | ![Java Model Generator Version](https://img.shields.io/docker/v/fernapi/java-model)              |
| `fernapi/fern-ruby-model`     | ![Ruby Model Generator Version](https://img.shields.io/docker/v/fernapi/fern-ruby-model)         |
| `fernapi/fern-go-model`       | ![Go Model Generator Version](https://img.shields.io/docker/v/fernapi/fern-go-model)             |

### Spec Generators

Convert between API specification formats:

| Generator ID           | Latest Version                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `fernapi/fern-openapi` | ![OpenAPI Generator Version](https://img.shields.io/docker/v/fernapi/fern-openapi) |
| `fernapi/fern-postman` | ![Postman Generator Version](https://img.shields.io/docker/v/fernapi/fern-postman) |

## 🌿 Fern Definition

> "Fern is a mission-critical part of our API. Keeping our docs, SDKs, and server implementation in sync was a nightmare. Fern enabled us to adopt API-first development."
> — **Steve Yazicioglu**, Head of Engineering at Candid Health

While we support OpenAPI, AsyncAPI, OpenRPC, and gRPC, we also offer the Fern Definition format as a simpler alternative for defining your API.

```yaml
types:
  MovieId: string

  Movie:
    properties:
      id: MovieId
      title: string
      rating:
        type: double
        docs: The rating scale is one to five stars

service:
  auth: false
  base-path: /movies
  endpoints:
    getMovie:
      method: GET
      path: /{movieId}
      path-parameters:
        movieId: MovieId
      response: Movie
      errors:
        - MovieDoesNotExistError
```

Check out open source, AI projects using Fern:
- [Skyvern](https://github.com/Skyvern-AI/skyvern/tree/main/fern) - AI-powered browser automation
- [BAML](https://github.com/BoundaryML/baml/tree/canary/fern) - AI Markup Language
- [Opik](https://github.com/comet-ml/opik/tree/main/sdks/code_generation/fern) - Platform for logging and evaluating LLM traces

## 🌿 Enterprise Solutions

For enterprise needs, Fern offers:

- **SDK Team**: We partner with you to perfect your OpenAPI spec and launch SDKs that scale to millions of downloads
- **Docs Team**: Our team creates a custom theme, migrates all your content, and launches your site

[Book a demo](https://buildwithfern.com/book-a-demo) to learn more.

## 🌿 Community

[Join our Slack community](https://buildwithfern.com/slack) to connect with other developers and get help from the Fern team.

## 🌿 Contributing

We welcome community contributions. For guidelines, refer to our [CONTRIBUTING.md](/CONTRIBUTING.md).

### Our Amazing Contributors 

![Fern Contributors](https://contrib.rocks/image?repo=fern-api/fern)

### Ways to Contribute

- **Issues**: Report bugs or suggest feature enhancements
- **Documentation**: Help improve our guides and references
- **Community**: Answer questions in our [Slack community](https://buildwithfern.com/slack)
- **Examples**: Share how you're using Fern in your projects
- **Code**: Submit pull requests for bug fixes or new features

## 💬 What Developers Say

> "Since adopting Fern, customers have migrated rapidly to our new SDKs and have been blown away by the quality. We used an alternative SDK generator for years, and customers constantly complained."
> 
> — **Gil Feig**, CTO at Merge.dev

