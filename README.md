<br/>
<div align="center">
  <a href="https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern&utm_content=logo">
    <img src="/fern/docs/images/logo-green.png" height="80" align="center" alt="header" />
  </a>
<br/>

<br/>

![YC](https://img.shields.io/badge/Y%20Combinator-2023-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

[![Discord](https://img.shields.io/badge/Join%20Our%20Community-black?logo=discord)](https://discord.com/invite/JkkXumPzcG)
[![Documentation](https://img.shields.io/badge/Read%20our%20Documentation-black?logo=book)](https://docs.buildwithfern.com?utm_source=fern-api/fern/readme-read-our-documentation)

</div>

Fern is a platform for generating Stripe-level SDKs (client libraries) and Docs for your API. Get started by passing in your OpenAPI specification.

<div align="center">
    <img src="/fern/docs/images/overview.png" width="700" alt="Overview Diagram">
</div>

### 🌿 SDKs (API Clients)

Our generators read in your OpenAPI spec as input and output SDKs. Fern handles publishing the generated SDKs to GitHub and package managers like NPM and PyPI.

Developers choose Fern over the [openapi-generator](https://github.com/OpenAPITools/openapi-generator) project because
1. Quality: Fern generates idiomatic code that feels handwritten
2. Support: Fern is actively maintained and improved; 1,000+ commits last year
3. Automation: Fern offers a CLI for end-to-end automation, eliminating your engineering effort

#### SDK Generators

| Generator ID                        | Description                                                    | Latest Version | Changelog                                                    | Entrypoint                                                         |
| ----------------------------------- | -------------------------------------------------------------- | -------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| fernapi/fern-typescript-node-sdk    | TypeScript SDK generator for Node.js applications              | 0.9.5          | -                                                            | -                                                                  |
| fernapi/fern-typescript-browser-sdk | TypeScript SDK generator for Browser-based applications        | 0.9.5          | -                                                            | -                                                                  |
| fernapi/fern-python-sdk             | Python SDK generator                                           | 0.8.0          | [CHANGELOG.md](./generators/python/pydantic/CHANGELOG.md)    | [cli.py](./generators/python/src/fern_python/generators/sdk/cli.py) |
| fernapi/fern-java-sdk               | SDK generator for Java/Kotlin/JVM                              | 0.6.1          | -                                                            | -                                                                  |
| fernapi/fern-go-sdk                 | Go SDK generator                                               | 0.12.0         | -                                                            | -                                                                  |
| fernapi/fern-csharp-sdk             | C# SDK generator for .NET platforms                            | 0.0.0          | -                                                            | -                                                                  |
| fernapi/fern-ruby-sdk               | Ruby SDK generator                                             | 0.0.0          | [CHANGELOG.md](https://github.com/fern-api/fern/blob/main/generators/ruby/sdk/CHANGELOG.md) | -                                                                  |

For additional language support, visit [the Fern issues](https://github.com/fern-api/fern/issues) and let us know!

### 🌿 API Documentation

Fern will build and host a documentation website with an auto-generated API reference. Write additional pages in markdown and have them versioned with git. Search, SEO, dark mode, and more are provided out-of-the-box.

Browse docs built with Fern:

- [reference.flatfile.com](https://reference.flatfile.com/api-reference/documents/create-a-document)
- [docs.superagent.sh](https://docs.superagent.sh/)
- [docs.propexo.com](https://docs.propexo.com/)

## Community

[Join our Discord!](https://discord.com/invite/JkkXumPzcG) We are here to answer questions and help you get the most out of Fern.

## Contributing

We welcome community contributions. For guidelines, refer to our [CONTRIBUTING.md](/CONTRIBUTING.md).

![Fern Contributors](https://contrib.rocks/image?repo=fern-api/fern)
