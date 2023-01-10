![Fern header](header.png)

<a href="https://www.npmjs.com/package/fern-api" alt="fern-api npm package">
  <img src="https://img.shields.io/npm/v/fern-api?style=flat-square" />
</a>

[Documentation ➚](https://www.buildwithfern.com/docs)

[Discord ➚](https://discord.com/invite/JkkXumPzcG)

---

**Fern is an open source format for defining REST APIs.**
You can think of it like a programming language to describe
your API: your endpoints, types, errors, and examples.

This repository contains the **Fern compiler.** The compiler transforms the API description into useful outputs, like:

### 🌿 SDKs

Client libraries speed up internal developement, and help acquire customers who use your API. Our auto-generated SDKs are idiomatic and feel handwritten.

[TypeScript SDK generator ➚](https://github.com/fern-api/fern-typescript)

[Java SDK generator ➚](https://github.com/fern-api/fern-java)

### 🌿 Server-side code generation

We automatically generate lots of boilerplate on the server side, like Pydantic models for FastAPI and Jersey interfaces for Spring Boot. We also add compile-time validation that all your endpoints are being served correctly.

[FastAPI generator ➚](https://github.com/fern-api/fern-python)

[Spring Boot generator ➚](https://github.com/fern-api/fern-java)

### 🌿 Postman Collection

Complete with examples of successful and unsuccessful requests!

[Postman generator ➚](https://github.com/fern-api/fern-postman)

### 🌿 An OpenAPI spec

You can feed the generated OpenAPI into the endless list of tools that support OpenAPI.

[OpenAPI generator ➚](https://github.com/fern-api/fern-postman)
