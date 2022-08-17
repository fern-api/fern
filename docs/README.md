<!-- markdownlint-disable MD033 -->

# Fern

> **Define your API once.** Get end-to-end type safety across clients, server stubs, and docs.

<a href="https://www.loom.com/share/c892f4a9fc674c4bb42fb31d395d9ebf">
    <p>Fern TypeScript Server Tutorial</p>
    <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/c892f4a9fc674c4bb42fb31d395d9ebf-1657127975624-with-play.gif">
  </a>

## How does it work?

![Overview diagram](/docs/assets/diagrams/overiew-diagram-dark.png)

Fern reads in your [Fern API Definition](#what-is-a-fern-api-definition), invokes remote [generators](#what-are-fern-generators), and creates clients, server stubs, and interactive documentation for your API.

- **Client libraries**: one generated SDK for each supported platform and language that's automatically published to a registry (e.g., NPM, Maven, PyPI)!

- **Servers**: get server stubs for your API so all you need to do is implement the server logic.

- **Documentation**: let consumers quickly learn how the API is supposed to behave and try out API calls directly in the browser.

## Why use Fern?

### 1. Practice schema-first API design

Write your [Fern API Definition](#what-is-a-fern-api-definition) before writing any code. This single source of truth keeps your client libraries (SDKs), server implementation, and documentation in sync. Companies like _Amazon, Palantir, and Stripe_ practice this method of API development.

### 2. Best-in-class code generation

Ferrari makes luxury sports cars. Fern generates high-quality code. Generated code is **idiomatic** (i.e., it follows the convention of the language) and **strongly typed** (i.e., the types of variables and objects are explicitly specified).

### 3. Iterate faster

With an API definition, development projects that involve multiple engineers/teams (e.g., backend, web, mobile) can proceed much faster. Frontend teams can immediately start building components regardless of whether or not the backend is ready.

## What is a Fern API Definition?

A [**Fern API Definition**](definition.md#what-is-a-fern-api-definition) is a set of YAML files that describe your API.

## What are Fern Generators?

[**Generators**](generators.md) convert a Fern API Definition into clients, servers, and documentation.

## How is this different than OpenAPI?

Fern is optimized for [high-quality codegen](comparison.md#_1-how-is-fern-different-than-openapi-fka-swagger).
