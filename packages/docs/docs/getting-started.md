---
title: Getting started
---

<!-- markdownlint-disable MD033 MD025 MD010 -->

Welcome to Fern! This guide walks through setting up Fern in your repo, defining your API, and generating code.

## Setting up Fern in your repo

### Install

In terminal, run `npm install -g fern-api`.

### Initialize

In the root of your repo, run `fern init.` This will create the following folder structure in your project:

```yml
fern/
└── api
		├── definition
				├── api.yml # Your API name and the authentication scheme
				└── imdb.yml # An example Fern Definition for IMDb (International Movie Database)
		└── generators.yml # A list of code generators you're using
fern.config.json # Configure your organization name and the version of Fern CLI you're using
```

## Defining your API

Your **Fern Definition** is a set of YAML files that are the single source of truth for your API. You check your **Fern Definition** into your repo, inside of which describes your API requests, responses, model, paths, methods, errors, and authentication scheme.

Check out [an example Fern Definition](https://github.com/fern-api/fern-examples/blob/main/fern/api/definition/movie.yml) on Github.

:::tip Already have an OpenAPI spec?

[Join our private beta](mailto:hey@buildwithfern.com?subject=%5BPrivate%20Beta%5D%20OpenAPI%20to%20Fern%20Definition%20converter) for access to our OpenAPI spec -> Fern Definition converter.

:::

## Generate code

Fern's code generators run remotely in the cloud. The input is your **Fern Definition** and the output is auto-generated code. You configure which generators you're using in [`generators.yml`](./cli/generate.md).

Check out [an example generators.yml](https://github.com/fern-api/fern-examples/blob/main/fern/api/generators.yml) on Github.

## What's next?

- [How do I get SDKs?](./features/sdk.md)
- [How do I get API documentation?](./features/api-docs.md)
- [How do I get server-side type safety?](./features/server.md)
- [How do I get a Postman integration?](./features/postman.md)
