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

[![Documentation](https://img.shields.io/badge/Read%20our%20Docs-black?logo=book)](https://buildwithfern.com/learn/home?utm_source=fern-api/fern/readme-read-our-documentation)
[![Book a demo](https://img.shields.io/badge/Book%20a%20demo-fcfcfd)](https://buildwithfern.com/book-demo?utm_source=fern-github-readme)
[![Start for free](https://img.shields.io/badge/Start%20for%20free-008700)](https://dashboard.buildwithfern.com/sign-up?redirect_on_login=%2Fget-started&utm_source=fern-github-readme)

</div>

# 🌿 What is Fern?

Fern is a platform that transforms your API definitions into production-ready SDKs and beautiful documentation in minutes. 

With Fern, you can offer your users:

- 🧩 **Type-safe SDKs** in multiple languages, including TypeScript, Python, Java, Go, Ruby, PHP, and C#
- 📘 **Developer documentation** featuring an interactive UI and auto-generated API + SDK references
- ✨ **AI Search** powered by an assistant trained on your docs, APIs, and SDKs that can instantly answer a developer's questions

Fern supports leading API specifications including OpenAPI (REST, Webhooks), AsyncAPI (WebSockets), Protobuf (gRPC), and OpenRPC.

<div align="center">
    <a href="/fern/images/overview-dark.png" target="_blank">
        <picture>
            <source srcset="/fern/images/overview-dark.png" media="(prefers-color-scheme: dark)">
            <source srcset="/fern/images/overview-light.png" media="(prefers-color-scheme: light)">
            <img src="/fern/images/overview-light.png" width="700" alt="Overview Diagram">
        </picture>
    </a>
</div>

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

- [elevenlabs.io/docs](https://elevenlabs.io/docs)
- [launchdarkly.com/docs](https://launchdarkly.com/docs/home)
- [docs.hume.ai](https://docs.hume.ai/)

Get started [here](https://github.com/fern-api/docs-starter).

## 🌿 Generators

Generators are processes that take your API Definition as input and output artifacts (SDKs, Server boilerplate, etc.). To add a generator, run `fern add <generator id>`.

### SDK Generators

| Generator ID                       | Latest Version                                                                                    | Changelog                                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `fernapi/fern-typescript-sdk`      | ![Typescript Generator Version](https://img.shields.io/docker/v/fernapi/fern-typescript-sdk)      | [Changelog](https://buildwithfern.com/learn/sdks/generators/typescript/changelog)                               |
| `fernapi/fern-python-sdk`          | ![Python Generator Version](https://img.shields.io/docker/v/fernapi/fern-python-sdk)              | [Changelog](https://buildwithfern.com/learn/sdks/generators/python/changelog)                                   |
| `fernapi/fern-java-sdk`            | ![Java Generator Version](https://img.shields.io/docker/v/fernapi/fern-java-sdk)                  | [Changelog](https://buildwithfern.com/learn/sdks/generators/java/changelog)                                     |
| `fernapi/fern-ruby-sdk`            | ![Ruby Generator Version](https://img.shields.io/docker/v/fernapi/fern-ruby-sdk)                  | [Changelog](https://buildwithfern.com/learn/sdks/generators/ruby/changelog)                                     |
| `fernapi/fern-go-sdk`              | ![Go Generator Version](https://img.shields.io/docker/v/fernapi/fern-go-sdk)                      | [Changelog](https://buildwithfern.com/learn/sdks/generators/go/changelog)                                       |
| `fernapi/fern-csharp-sdk`          | ![C# Generator Version](https://img.shields.io/docker/v/fernapi/fern-csharp-sdk)                  | [Changelog](https://buildwithfern.com/learn/sdks/generators/csharp/changelog)                                   |
| `fernapi/fern-php-sdk`             | ![PHP Generator Version](https://img.shields.io/docker/v/fernapi/fern-php-sdk)                    | [Changelog](https://buildwithfern.com/learn/sdks/generators/php/changelog)                                      |
| `fernapi/fern-swift-sdk`           | ![Swift Generator Version](https://img.shields.io/docker/v/fernapi/fern-swift-sdk)                | [Changelog](https://buildwithfern.com/learn/sdks/generators/swift/changelog)                                    |
| `fernapi/fern-rust-sdk`            | ![Rust Generator Version](https://img.shields.io/docker/v/fernapi/fern-rust-sdk)                  | [Changelog](https://buildwithfern.com/learn/sdks/generators/rust/changelog)                                     |

### Model Generators

Fern's model generators will output schemas or types defined in your OpenAPI spec or Fern Definition.

| Generator ID                  | Latest Version                                                                                   | Changelog                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `fernapi/fern-pydantic-model` | ![Pydantic Model Generator Version](https://img.shields.io/docker/v/fernapi/fern-pydantic-model) | [versions.yml](./generators/python/pydantic/versions.yml)                     |
| `fernapi/fern-java-model`     | ![Java Model Generator Version](https://img.shields.io/docker/v/fernapi/fern-java-model)         | [versions.yml](./generators/java/model/versions.yml)                          |
| `fernapi/fern-go-model`       | ![Go Model Generator Version](https://img.shields.io/docker/v/fernapi/fern-go-model)             | [versions.yml](./generators/go/model/versions.yml)                            |

### Spec Generators

Fern's spec generators can output an OpenAPI spec.

> **Note**: The OpenAPI spec generator is primarily intended for Fern Definition users. This prevents lock-in so that one can always export to OpenAPI.

| Generator ID           | Latest Version                                                                     | Changelog                                              |
| ---------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `fernapi/fern-openapi` | ![OpenAPI Generator Version](https://img.shields.io/docker/v/fernapi/fern-openapi) | [versions.yml](./generators/openapi/versions.yml)      |

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

## Contributing

We welcome community contributions. For guidelines, refer to our [CONTRIBUTING.md](/CONTRIBUTING.md). To contribute to our documentation, refer to our [docs](https://github.com/fern-api/docs) repo.

### Development Environment

This repository uses [DevBox](https://www.jetify.com/devbox) for reproducible development environments. DevBox provides cross-platform support (Mac, Linux, Windows via WSL) with exact version pinning based on Nix.

To get started:

```bash
# Install DevBox (https://www.jetify.com/devbox/docs/installing_devbox/)
curl -fsSL https://get.jetify.com/devbox | bash

# Enter the development environment
devbox shell
```

DevBox automatically installs all required dependencies including Node.js, pnpm, Go, Python, Poetry, JDK, and buf with pinned versions matching CI.

![Fern Contributors](https://contrib.rocks/image?repo=fern-api/fern)
