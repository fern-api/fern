---
title: Comparison
---

## OpenAPI

1. The OpenAPI description is incredibly flexible, but as a result, the SDK generators are notorious for generating code that isn’t idiomatic and sometimes [doesn’t even compile](https://github.com/OpenAPITools/openapi-generator/issues?q=is%3Aissue+%22doesn%27t+compile%22).

2. When it comes to docs, some companies will generate beautiful API documentation from your OpenAPI description. But because they don’t own the SDK generation, good luck finding one that’ll automatically include examples of how to use your SDKs.

3. It’s not really a single source of truth because your OpenAPI description can easily drift from your backend - OpenAPI’s generated “server stubs” aren’t helpful once you make the first change to your API.

## Smithy

_Work in progress_

## Conjure

_Work in progress_

## Hand-rolling

_Work in progress_
