---
title: Introduction
---

<!-- markdownlint-disable MD033 -->

When it comes to API development, there’s a gap between what’s **_reasonable_** and what’s **_feasible_**.

## The problem

It’s **reasonable** to want a [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) approach to API development. Every software engineer knows that drift is inevitable with multiple sources of truth. This is why API docs are constantly out of date or why SDKs are missing the latest features.

It’s **reasonable** to want great SDKs for your API, even in languages you don’t happen to be familiar with.

And it’s **reasonable** to want examples of how to use those SDKs in your API docs.

Despite feeling like reasonable asks, completing them is hardly feasible. Unless you can invest in an engineering team to build great internal tooling for your APIs—like Stripe and Palantir have—there are no good options. The closest thing to a single source of truth is OpenAPI, which is [**far from ideal**](openapi.md).

## The solution

Fern is the single source of truth for your API. Define your API in Fern to:

1. **Generate idiomatic SDKs that feel hand-written**. Fern generates SDKs in the cloud and can publish them to public registries like npm, PyPi, and Maven.
1. **Verify that your backend serves the API correctly**. Fern integrates with popular frameworks like Express, FastAPI, and Spring to add compile-time and run-time checks.
1. **Build and host API documentation**. With Fern, you automatically get Stripe-like documentation with examples of using the SDKs, not just [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) and [requests](https://pypi.org/project/requests/).
1. **Integrate with Postman**. A first-class integration with Postman; changes you make to your API automatically update in your Postman Workspace.
1. **Leave you with an OpenAPI document**. Fern also generates OpenAPI, so you’re never locked in and can use any other tools that integrate with OpenAPI.

We’re in private beta with a handful of customers. If you’re interested in using Fern, [**reach out**](mailto:hey@buildwithfern.com?subject=%5BPrivate%20beta%5D%20Interest%20in%20joining).
