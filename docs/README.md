# Fern

> **Fern is a framework for building APIs.** You can think of it as an alternative to OpenAPI/Swagger.

<a href="https://www.loom.com/share/410f13c725ab4403aac77b237f9fe1f1" target="_blank">
    <p>Demo: building an API with Fern</p>
    <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/410f13c725ab4403aac77b237f9fe1f1-1654645327734-with-play.gif">
  </a>

### Goals

**1. High-quality code generation.**

Generators can be written in any language, for any language. Generated servers and clients are idiomatic and easy to use.

**2. Plugin support.**

Generators can define plugin points to expand their functionality. For example, a plugin may add support for gRPC or could add Auth0 authorization checks for each endpoint.

**3. Protocol flexibility.**

Use HTTP when you want RESTful calls. Use WebSockets when you want subscriptions. Use TCP when you care about performance. Fern manages the transport layer and provides similar interfaces so you can use the best protocol for the job.

**4. Errors as a first-class concept.**

Every request can result in success or failure. Errors are strongly typed so it's easy for consumers to handle them.

### How does it work?

An API begins as a **Fern Definition**, a set of YAML files that describe your API. For example, here's a Fern Definition for a simple API to get the current day of the week:

```yaml
types:
  DayOfWeek:
    enum:
      - SUNDAY
      - MONDAY
      - TUESDAY
      - WEDNESDAY
      - THURSDAY
      - FRIDAY
      - SATURDAY
services:
  http:
    DayOfWeekService:
      auth: none
      endpoints:
        getCurrentDayOfWeek:
          method: GET
          path: /day-of-week
          response: DayOfWeek
```

Fern reads in the Definition, validates it, and invokes generators. Some examples of generators are:

| Generator         | Description                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `fern-typescript` | converts a Fern Definition to a TypeScript server and a TypeScript client                |
| `fern-java`       | converts a Fern Definition to a Java server and a Java client                            |
| `fern-postman`    | converts a Fern Definition to a [Postman Collection](https://www.postman.com/collection) |
| `fern-openapi`    | converts a Fern Definition to an [OpenAPI Spec](https://swagger.io/resources/open-api/)  |
| `fern-docs`       | converts a Fern Definition to an interactive documentation site                          |
