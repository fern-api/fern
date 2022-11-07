---
title: Introduction
---

<!-- markdownlint-disable MD033 -->

When it comes to API development, there’s a gap between what’s **_reasonable_** and what’s **_feasible_**.

It’s **reasonable** to want a [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) approach to API development. Every software engineer knows that drift is inevitable with multiple sources of truth. This is why API docs are constantly out of date or why SDKs are missing the latest features.

It’s **reasonable** to want great SDKs for your API, even in languages you don’t happen to be familiar with.

And it’s **reasonable** to want examples of how to use those SDKs in your API docs.

Despite feeling like reasonable asks, completing them is hardly feasible. Unless you can invest in an engineering team to build great internal tooling for your APIs—like Stripe and Palantir have—there are no good options. The closest thing to a single source of truth is OpenAPI, which is [**far from ideal**](comparison.md#openapi).

Fern allows you to maintain a single source of truth for your API so that you can:

1. **Generate idiomatic SDKs** in the most popular languages: TypeScript/JavaScript, Python, Java, Go. Fern also handles publishing to registries.
1. **Serve your API accurately**. Fern integrates with popular frameworks like Express, FastAPI, and Spring to add compile-time and run-time checks.
1. **Auto-update** your **API documentation**, **Postman collection**, and **OpenAPI description** any time your API changes.

We’re in private beta with a handful of customers. If you’re interested in using Fern, [**reach out**](mailto:hey@buildwithfern.com?subject=%5BPrivate%20beta%5D%20Interest%20in%20joining).
