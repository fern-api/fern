<br/>
<div align="center">
  <a href="https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern&utm_content=logo">
    <img src="/fern/images/logo-green.png" height="80" align="center" alt="header" />
  </a>
<br/>

<br/>

[![2023 Y Combinator Startup](https://img.shields.io/badge/Y%20Combinator-2023-orange)](https://www.ycombinator.com/companies/fern)
![License](https://img.shields.io/badge/License-MIT-blue)

[![Discord](https://img.shields.io/badge/Join%20Our%20Community-black?logo=discord)](https://discord.com/invite/JkkXumPzcG)
[![Documentation](https://img.shields.io/badge/Read%20our%20Documentation-black?logo=book)](https://buildwithfern.com/learn/home?utm_source=fern-api/fern/readme-read-our-documentation)

</div>

Fern is a toolkit that allows you to input your API Definition and output SDKs and API documentation. Fern is compatible with the OpenAPI specification (formerly Swagger).

<div align="center">
    <img src="/fern/images/overview.png" width="700" alt="Overview Diagram">
</div>

## 🌿 SDKs

The Fern toolkit is available via a command line interface (CLI) and requires Node 18+. To install it, run:

```bash
npm install -g fern-api
```

Initialize Fern with your OpenAPI spec:

```bash
fern init --openapi ./path/to/openapi.yml
# or
fern init --openapi https://link.buildwithfern.com/petstore-openapi
```

Your directory should look like the following:

```yaml
fern/
├─ fern.config.json
├─ generators.yml # generators you're using
└─ openapi/
  └─ openapi.json # your openapi document
```

Finally, to invoke the generator, run:

```bash
fern generate
```

🎉 Once the command completes, you'll see your SDK in `/generated/sdks/typescript`.

## 🌿 API Documentation

Fern can also build and host a documentation website with an auto-generated API reference. Write additional pages in markdown and have them versioned with git. Search, SEO, dark mode, and popular components are provided out-of-the-box. Plus, you can customize the colors, font, logo, and domain name.

Check out docs built with Fern:

- [docs.vellum.ai](https://docs.vellum.ai)
- [docs.superagent.sh](https://docs.superagent.sh/)
- [docs.hume.ai](https://docs.hume.ai/)

Get started [here](https://github.com/fern-api/docs-starter-openapi).

## 🌿 Generators

Generators are process that take your API Definition as input and output artifacts (SDKs,
Postman Collections, Server boilerplate, etc.). To add a generator run `fern add <generator id>`

### SDK Generators

| Generator ID                           | Latest Version | Changelog                                                    | Entrypoint                                                                      |
| -------------------------------------- | -------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `fernapi/fern-typescript-node-sdk`     | [![Typescript Generator Version](https://img.shields.io/docker/v/fernapi/fern-typescript-node-sdk)](./generators/typescript/sdk/VERSION) | [CHANGELOG.md](./generators/typescript/sdk/CHANGELOG.md)     | [cli.ts](./generators/typescript/sdk/cli/src/nodeCli.ts)                        |
| `fernapi/fern-python-sdk`              | [![Python Generator Version](https://img.shields.io/docker/v/fernapi/fern-python-sdk)](./generators/python/sdk/VERSION)                  | [CHANGELOG.md](./generators/python/sdk/CHANGELOG.md)         | [cli.py](./generators/python/src/fern_python/generators/sdk/cli.py)             |
| `fernapi/fern-java-sdk`                | [![Java Generator Version](https://img.shields.io/docker/v/fernapi/fern-java-sdk)](./generators/java/sdk/VERSION)                        | [CHANGELOG.md](./generators/java/sdk/CHANGELOG.md)           | [Cli.java](./generators/java/sdk/src/main/java/com/fern/java/client/Cli.java)   |
| `fernapi/fern-ruby-sdk`                | [![Ruby Generator Version](https://img.shields.io/docker/v/fernapi/fern-ruby-sdk)](./generators/ruby/sdk/VERSION)                        | [CHANGELOG.md](./generators/ruby/sdk/CHANGELOG.md)           | [cli.ts](./generators/ruby/sdk/src/cli.ts)                                      |
| `fernapi/fern-go-sdk`                  | [![Go Generator Version](https://img.shields.io/docker/v/fernapi/fern-go-sdk)](./generators/go/sdk/VERSION)                              | [CHANGELOG.md](./generators/go/sdk/CHANGELOG.md)             | [main.go](./generators/go/cmd/fern-go-sdk/main.go)                              |
| `fernapi/fern-csharp-sdk`              | [![C# Generator Version](https://img.shields.io/docker/v/fernapi/fern-csharp-sdk)](./generators/csharp/sdk/VERSION)                      | [CHANGELOG.md](./generators/csharp/sdk/CHANGELOG.md)         | [cli.ts](./generators/csharp/sdk/src/cli.ts)                                    |

### Server-side Generators

Fern's server-side generators output boilerplate application code (models and networking logic). This is intended for spec-first or API-first developers,
who write their API definition (as an OpenAPI spec or Fern definition) and want to generate backend code. Watch a demo [here](https://docs.buildwithfern.com/fern-sd-ks/other-generators/server-side/express-js#demo-video).

| Generator ID                  | Latest Version | Changelog                                                    | Entrypoint                                                                       |
| ----------------------------- | -------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `fernapi/fern-typescript-express` | [![Typescript Express Server Generator Version](https://img.shields.io/docker/v/fernapi/fern-typescript-express)](./generators/typescript/express/VERSION) | [CHANGELOG.md](./generators/typescript/express/CHANGELOG.md) | [cli.ts](./generators/typescript/express/cli/src/cli.ts)                         |
| `fernapi/fern-fastapi-server` | [![Python FastAPI Server Generator Version](https://img.shields.io/docker/v/fernapi/fern-fastapi-server)](./generators/python/fastapi/VERSION) | [CHANGELOG.md](./generators/python/fastapi/CHANGELOG.md)     | [cli.py](./generators/python/src/fern_python/generators/sdk/cli.py)              |
| `fernapi/fern-java-spring`    | [![Java Spring Server Generator Version](https://img.shields.io/docker/v/fernapi/fern-java-spring)](./generators/java/spring/VERSION) | [CHANGELOG.md](./generators/java/spring/CHANGELOG.md)        | [Cli.java](./generators/java/spring/src/main/java/com/fern/java/spring/Cli.java) |

### Model Generators

Fern's model generators will output schemas or types defined in your OpenAPI spec or Fern Definition.

| Generator ID                  | Latest Version | Changelog                                                 | Entrypoint                                                                    |
| ----------------------------- | -------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `fernapi/fern-pydantic-model` | [![Pydantic Model Generator Version](https://img.shields.io/docker/v/fernapi/fern-pydantic-model)](./generators/python/pydantic/VERSION) | [CHANGELOG.md](./generators/python/pydantic/CHANGELOG.md) | [cli.py](./generators/python/src/fern_python/generators/sdk/cli.py)           |
| `fernapi/java-model`     | [![Java Model Generator Version](https://img.shields.io/docker/v/fernapi/java-model)](./generators/java/model/VERSION) | [CHANGELOG.md](./generators/java/model/CHANGELOG.md)        | [Cli.java](./generators/java/sdk/src/main/java/com/fern/java/client/Cli.java) |
| `fernapi/fern-ruby-model`     | [![Ruby Model Generator Version](https://img.shields.io/docker/v/fernapi/fern-ruby-model)](./generators/ruby/model/VERSION)| [CHANGELOG.md](./generators/ruby/model/CHANGELOG.md)      | [cli.ts](./generators/ruby/model/src/cli.ts)                                  |

### Spec Generators

Fern's spec generators can output an OpenAPI spec or a Postman collection.

> **Note**: The OpenAPI spec generator is primarly intended for Fern Definition users. This prevents lock-in so that one can always export to OpenAPI.

| Generator ID           | Latest Version | Changelog                                         | Entrypoint                                 |
| ---------------------- | -------------- | ------------------------------------------------- | ------------------------------------------ |
| `fernapi/fern-openapi` | [![OpenAPI Generator Version](https://img.shields.io/docker/v/fernapi/fern-openapi)](./generators/openapi/VERSION) | [CHANGELOG.md](./generators/openapi/CHANGELOG.md) | [cli.ts](./generators/openapi/src/cli.ts)  |
| `fernapi/fern-postman` | [![Postman Generator Version](https://img.shields.io/docker/v/fernapi/fern-postman)](./generators/postman/VERSION) | [CHANGELOG.md](./generators/postman/CHANGELOG.md) | [cli.ts](./generators/postman/src/cli.ts) |

## 🌿 CLI Commands

Here's a quick look at the most popular CLI commands. View the documentation for [all CLI commands](https://docs.buildwithfern.com/overview/cli/overview).

`fern init`: adds a new starter API to your repository.

`fern check`: validate your API definition and Fern configuration.

`fern generate`: run the generators specified in `generators.yml` in the cloud.

`fern generate --local`: run the generators specified in `generators.yml` in docker locally.

`fern add <generator>`: include a new generator in your `generators.yml`. For example, `fern add fern-python-sdk`.

## Advanced

### API First

Fern supports developers and teams that want to be API-first or Spec-first.

Define your API, and use Fern to generate models, networking code and boilerplate application code. The generated code adds
type safety to your API implementation - if your backend doesn't implement the API correctly, it won't compile.

Frameworks currently supported:

- [Express](./generators/typescript)
- [Spring Boot](./generators/java)
- [FastAPI](./generators/python)

For a walkthrough, check out the [Fern + Express video](https://docs.buildwithfern.com/fern-sd-ks/other-generators/server-side/express-js#demo-video).

### Fern Definition

While we are big fans of OpenAPI, we know it isn't the _easiest_ format to read and write. If you're looking for an alternative,
give the Fern Definition a try.

Install the Fern CLI and initialize a Fern Project.

```bash
npm install -g fern-api
fern init
```

This will create the following folder structure in your project:

```yaml
fern/
├─ fern.config.json # root-level configuration
├─ generators.yml # generators you're using
└─ definition/
  ├─ api.yml  # API-level configuration
  └─ imdb.yml # endpoints, types, and errors
```

Here's what the `imdb.yml` starter file looks like:

```yaml
types:
  MovieId: string

  Movie:
    properties:
      id: MovieId
      title: string
      rating:
        type: double
        docs: The rating scale is one to five stars

  CreateMovieRequest:
    properties:
      title: string
      rating: double

service:
  auth: false
  base-path: /movies
  endpoints:
    createMovie:
      docs: Add a movie to the database
      method: POST
      path: /create-movie
      request: CreateMovieRequest
      response: MovieId

    getMovie:
      method: GET
      path: /{movieId}
      path-parameters:
        movieId: MovieId
      response: Movie
      errors:
        - MovieDoesNotExistError

errors:
  MovieDoesNotExistError:
    status-code: 404
    type: MovieId
```

Checkout open source projects that are using Fern Definitions:

- [Metriport](https://github.com/metriport/metriport/tree/develop/fern/definition)
- [Rivet](https://github.com/rivet-gg/rivet/tree/main/fern/definition)
- [Revert](https://github.com/revertinc/revert/tree/main/fern/definition)

## Inspiration

Fern is inspired by internal tooling built to enhance the developer experience. We stand on the shoulders of giants. While teams were responsible for building the following tools, we want to give a shout out to Mark Elliot (creator of Conjure at Palantir), Michael Dowling (creator of Smithy at AWS), and Ian McCrystal (creator of Stripe Docs).

## Community

[Join our Discord!](https://discord.com/invite/JkkXumPzcG) We are here to answer questions and help you get the most out of Fern.

## Contributing

We welcome community contributions. For guidelines, refer to our [CONTRIBUTING.md](/CONTRIBUTING.md).

![Fern Contributors](https://contrib.rocks/image?repo=fern-api/fern)
