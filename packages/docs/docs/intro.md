---
title: Introduction
---

When it comes to API development, there’s a gap between what’s _reasonable_ and what’s _feasible_.

It’s reasonable to want a [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) approach to API development. Every software engineer knows that drift is inevitable with multiple sources of truth. This is why API docs are constantly out of date or why SDKs are missing the latest features.

It’s reasonable to want great SDKs for your API, even in languages you don’t happen to be familiar with.

And it’s reasonable to want examples of how to use those SDKs in your API docs.

Despite feeling like reasonable asks, completing them is hardly feasible. Unless you can invest in an engineering team to build great internal tooling for your APIs—like Stripe and Palantir have—there are no good options. The closest thing to a single source of truth is OpenAPI, which is **far** from ideal.

<div style="margin-left: 15px">

The OpenAPI spec is incredibly flexible, but as a result, the SDK generators are notorious for generating code that isn’t idiomatic and sometimes [doesn’t even](https://github.com/OpenAPITools/openapi-generator/issues?q=is%3Aissue+%22doesn%27t+compile%22) compile.

When it comes to docs, some companies will generate beautiful API documentation from your OpenAPI spec. But because they don’t own the SDK generation, good luck finding one that’ll automatically include examples of how to use your SDKs.

And it’s not really a single source of truth because your OpenAPI spec can easily drift from your backend - OpenAPI’s generated “server stubs” aren’t helpful once you make the first change to your API.

</div>

**Fern is the single source of truth for your API.** You define your API in one place, and we'll:

1. **Generate idiomatic SDKs that feel hand-written**. We generate SDKs in the cloud and can publish them to public registries like npm, PyPi, and Maven.
1. **Verify that your backend serves the API correctly**. We integrate with popular frameworks like Express, FastAPI, and Spring Boot to add compile-time and run-time checks.
1. **Build and host API documentation**. With Fern, you automatically get Stripe-like documentation with examples of using the SDKs, not just [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) and [requests](https://pypi.org/project/requests/).
1. **Integrate with Postman**. A first-class integration with Postman; changes you make to your API automatically update in your Postman Workspace.
1. **Leave you with an OpenAPI spec**. Fern also generates an OpenAPI spec, so you’re never locked in and able to use any other tools that integrate with OpenAPI.

We’re in private beta with a handful of customers. If you’re interested in using Fern, please [reach out](mailto:hey@buildwithfern.com?subject=%5BPrivate%20beta%5D%20Interest%20in%20joining).
