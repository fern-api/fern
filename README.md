<br/>
<div align="center">
  <a href="https://www.buildwithfern.com/">
    <img src="fern.png" height="120" align="center" alt="header" />
  </a>
  <br/>

# Fern

![YC](https://img.shields.io/badge/Y%20Combinator-2023-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

[![Discord](https://img.shields.io/badge/Join%20Our%20Community-black?logo=discord)](https://discord.com/invite/JkkXumPzcG)
[![Documentation](https://img.shields.io/badge/Read%20our%20Documentation-black?logo=book)](https://docs.buildwithfern.com?utm_source=fern-api/fern/readme)

</div>

Fern is an open source toolkit for designing, building, and consuming REST APIs. **With Fern, you can generate SDKs (client libraries), API documentation, and boilerplate for your backend server.**

![overview diagram](fern/docs/images/overview.png)

## Motivation

REST APIs underpin the internet but are still painful to work with. They are often untyped, unstandardized, and out-of-sync across multiple sources of truth.

With Fern, we aim to bring great developer experiences to REST APIs. At AWS and Palantir, we saw first-hand how code generation tooling allows developers to build faster without worrying about the pitfalls of API development. **We’re building Fern open source to bring that tooling to every software company.**

## OpenAPI Compatability

Fern is **fully compatible with OpenAPI.** You can use your existing OpenAPI spec with Fern. We have designed Fern to complement existing OpenAPI toolchains and workflows, rather than replace them.

If you're not a fan of OpenAPI, you can also use Fern's [simpler format](https://docs.buildwithfern.com/api-definition/fern-definition) to define your API.

## Capabilities

The Fern CLI can generate the following types of artifacts:

### 🌿 SDKs

Whether you call them client libraries, SDKs, bindings, or wrappers, Fern generates idiomatic SDKs you can use to interact with your APIs. This makes it trivial to keep your SDKs in sync with your backend, and eliminates the need to write the SDKs manually.

Currently, the following languages are supported:

- [TypeScript](https://github.com/fern-api/fern-typescript)
- [Java](https://github.com/fern-api/fern-java)
- [Python](https://github.com/fern-api/fern-python)
- [Go](https://github.com/fern-api/fern-go)

Fern can publish your SDKs to registries, like npm, Maven, and PyPI. See [Publishing a public package](https://docs.buildwithfern.com/generate-sd-ks#publish-a-public-package).

If you'd like to see a language supported, head over to [the Fern issues](https://github.com/fern-api/fern/issues) to voice your support!

### 🌿 API Documentation

Fern builds and hosts a fully-featured documentation website. The API reference is auto-generated from your API definition. You can write additional pages -- such as `quickstart` or `how authentication works`) -- in markdown and Fern takes care of the rest. Search, SEO, dark mode, and popular components are provided out-of-the-box. Customize your "theme" to match your brand colors, font, and logo.

Get started with Fern Docs for free. Pay when you want to host your docs at a custom domain (`docs.your-website.com`).

### 🌿 Server boilerplate

Define your API, and Fern will generate models, networking code and boilerplate application code. The generated code adds type safety to your API implementation - if your backend doesn't implement the API correctly, it won't compile.

Fern currently supports:

- [Express](https://github.com/fern-api/fern-typescript)
- [Spring Boot](https://github.com/fern-api/fern-java)
- [FastAPI](https://github.com/fern-api/fern-python)

For a walkthrough, check out the [Fern + Express video](https://docs.buildwithfern.com/server-boilerplate/server-boilerplate/express-js#demo-video).

## Getting started

Here's a quickstart for:

[**Generating SDKs**](https://docs.buildwithfern.com/overview/welcome/quickstart)

[**API documentation**](https://github.com/fern-api/docs-starter)

## Customer Showcase

Discover how Fern helps developer-focused companies.

[![Customer Showcase](/fern/docs/images/showcase.png)](https://buildwithfern.com/showcase)

## Community

[Join our Discord!](https://discord.com/invite/JkkXumPzcG) We are here to answer questions and help you get the most out of Fern.

## Contributing

We highly value community contributions. See our [CONTRIBUTING.md](/CONTRIBUTING.md) document for more info on how you can contribute!

![Fern Contributors](https://contrib.rocks/image?repo=fern-api/fern)

## Attribution

Thanks to the folks at [Twemoji](https://twemoji.twitter.com/), an open source project, who created the graphic that we use as our logo.
