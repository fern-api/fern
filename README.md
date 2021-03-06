# Fern

Define your API once. Get end-to-end type safety across clients, server stubs, and docs.

[View our docs ➚](https://docs.buildwithfern.com/#/)

[Join the discord ➚](https://discord.com/invite/JkkXumPzcG)

### Goals

**1. High quality code generation.**

Generators can be written in any language, for any language. Generated servers and clients are idoimatic and easy to use.

**2. Plugin support.**

Generators can define plugin points to expand their functionality. For example, a plugin might add support for gRPC or add Auth0 authorization checks for each endpoint.

**3. Protocol flexiblility.**

Use HTTP when you want RESTful calls. Use WebSockets when you want subscriptions. Use TCP when you care about performance. Fern manages the transport layer and provides similar interfaces so you can use the best protocol for the job.

**4. Errors as a first class concept.**

Every request can result in success or failure. Errors are strongly typed so it's easy for consumers to handle them.

### How does it work?

An API begins as a **Fern Definition**, a set of YAML files that describe your API. For example, here's a **Fern Definition** for a simple API to get the current day of the week:

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
          response: DayOfWeek
```

Fern reads in the Definition, validates it, and invokes generators. Some examples of generators are:

| Generator         | Description                                                               |
| ----------------- | ------------------------------------------------------------------------- |
| `fern-typescript` | converts a Fern Definition to a TypeScript server and a TypeScript client |
| `fern-java`       | converts a Fern Definition to a Java server and a Java client             |
| `fern-postman`    | converts a Fern Definition to a Postman Collection                        |
| `fern-openapi`    | converts a Fern Definition to a OpenAPI Spec                              |
| `fern-docs`       | converts a Fern Definition to an interactive documentation site           |
