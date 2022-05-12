# Fern

</p>

TODO Fern makes it easy to define APIs.

### Single source of truth

Define your data model and your APIs in **one place** in your repo.

### Type-safe servers and clients

Run `fern generate` to automatically generate **server stubs** and **type-safe clients**.

> "Wow, this codegen is so idiomatic!" - Chuck Norris

## What languages are supported?

| **Language** | **Server Stub**  | **Client** |
| ------------ | ---------------- | ---------- |
| Java         | ✅               | ✅         |
| TypeScript   | 🚧 _in progress_ | ✅         |
| Python       | 🚧               | 🚧         |

_Interested in another language? [Get in touch](hey@buildwithfern.com)_

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

-   Fork the repo and make a branch
-   Write your code
-   Open a PR (optionally linking to a Github issue)

## Getting started

TODO

`fern init`

`fern generate`

`fern add`

## License

This tooling is made available under the [MIT License](LICENSE).
