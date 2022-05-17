# Fern

</p>

Fern makes it easier to build REST APIs. Fern is open source and interoperable with OpenAPI so you are never locked in.

A **Fern Definition** is an API description format for REST APIs (similar to the OpenAPI Spec) written to be a programming language-agnostic. **Fern Definitions** are written in YAML, allowing humans and computers to understand the capabilities of a service without having to read source code or inspect network requests.

Developers are most successful using Fern when designing their APIs (in YAML) before writing source code.

Use cases for **Fern Definitions** include:

- code generation for SDKs (i.e. clients & servers)

- interactive documentation (_e.g. docs.example.com_)

- generating Postman Collections

## Benefits of Fern

- Single source of truth: Define your data model and APIs **one place** in your repo.

- Type-safe servers and clients: Run `fern generate` to automatically generate **server stubs** and **type-safe clients**.

  - Our codegen reads like it was written by a human, not a computer.

    > _"Wow, this codegen is so idiomatic!"_ - Chuck Norris

## What languages are supported?

The Fern compiler reads API definitions written in the [human-readable YML format](/docs/fern_definitions.md) and produces a JSON [intermediate representation](/docs/intermediate_representation.md) (IR).

| **Language** | **Server Stub**  | **Client** |
| ------------ | ---------------- | ---------- |
| Java         | ✅               | ✅         |
| TypeScript   | 🚧 _in progress_ | ✅         |
| Python       | 🚧               | 🚧         |

_Interested in another language? [Get in touch.](hey@buildwithfern.com)_

## Let's do an example

Here's a simple API to get the current weather report:

```yaml
# api.yml

types:
  WeatherReport:
    properties:
      tempInFahrenheit: double
      humidity:
        type: integer
        docs: a number between 0 and 100
      conditions: WeatherConditions
  WeatherConditions:
    enum:
      - SUNNY
      - CLOUDY
      - RAINY

services:
  http:
    WeatherService:
      base-path: /weather
      endpoints:
        getWeather:
          method: GET
          path: /{zipCode}
          parameters:
            zipCode: string
          response: WeatherReport
```

### The server

Here's the Typescript/express server stubs that Fern generates:

TODO

### The client

Let's say we published the client to npm... TODO make this better. Here's an example of someone consuming it:

```ts
import { WeatherService } from "weather-api";

const weatherService = WeatherService.create({
  baseUrl:
})

const weatherReport = await Weather

```

## Contributing

The team welcomes contributions! To make code changes to one of the Fern repos:

- Fork the repo and make a branch
- Write your code
- Open a PR (optionally linking to a Github issue)

## Getting started

### Installation

`$ npm install -g fern-api`

### Initialize Fern in your repo

`fern init`

### Generate code

`fern generate`

`fern add`

## License

This tooling is made available under the [MIT License](LICENSE).
