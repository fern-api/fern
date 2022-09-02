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

Join our private beta for access to our OpenAPI spec -> Fern Definition converter. [Get in touch.](mailto:hey@buildwithfern.com?subject=%5BPrivate%20Beta%5D%20OpenAPI%20to%20Fern%20Definition%20converter)

:::

## What's next?

- How do I get server-side type safety?
- How do I get SDKs?
- How do I get API documentation?
- How do I get a Postman integration?

## Generate code

Fern's code generators run remotely in the cloud. The input is your **Fern Definition** and the output is auto-generated code. You configure which generators you're using in `generators.yml`.

Check out [an example generators.yml](https://github.com/fern-api/fern-examples/blob/main/fern/api/generators.yml) on Github.

### Add a generator

You can add a generator by running `fern add <generator>`. By default generators are added to `draft` which will not publish your code to public registries (e.g. npm, Maven, PyPi). Here are [a list of supported generators](TODO).

To generate a TypeScript SDK, we'd run:

```bash
fern add typescript-client
```

This would update our `generators.yml` to read:

```diff
-draft: []
+draft:
+  - name: fernapi/typescript-client
+    version: 0.0.xxx
release:[]
```

### Run generators

Once you've added generator(s), you'll invoke them by running:

```bash
fern generate
```

The output will look similar to:

```bash
┌─
│ ✓  fernapi/fern-typescript
│    ◦ @fern-examples-fern/imdb-client@0.0.1
└─
```

You've just generated a TypeScript SDK that can start being used immediately! Add it to your project's `package.json` and get going.
