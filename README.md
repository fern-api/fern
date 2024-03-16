<br/>
<div align="center">
  <a href="https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern&utm_content=logo">
    <img src="/fern/docs/images/logo-green.png" height="80" align="center" alt="header" />
  </a>
<br/>

<br/>

[![YC](https://img.shields.io/badge/Y%20Combinator-2023-orange)](https://www.ycombinator.com/companies/fern)
![License](https://img.shields.io/badge/License-MIT-blue)

[![Discord](https://img.shields.io/badge/Join%20Our%20Community-black?logo=discord)](https://discord.com/invite/JkkXumPzcG)
[![Documentation](https://img.shields.io/badge/Read%20our%20Documentation-black?logo=book)](https://docs.buildwithfern.com?utm_source=fern-api/fern/readme-read-our-documentation)

</div>

Fern is a toolkit that allows you to input your API Definition and output SDKs and API documentation. Fern is compatible with the OpenAPI specification (formerly Swagger).

<div align="center">
    <img src="/fern/docs/images/overview.png" width="700" alt="Overview Diagram">
</div>

## 🌿 SDKs

The Fern toolkit is available as a command line interface (CLI) and requires Node 18 or higher. To install it, run:

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
- [docs.propexo.com](https://docs.propexo.com/)

Get started [here](https://github.com/fern-api/docs-starter).

## 🌿 Generators

Generators are process that take your API Definition as input and output artifacts (SDKs,
Postman Collections, Server boilerplate, etc.). To add a generator run `fern add <generator id>`

### SDK Generators

| Generator ID                           | Latest Version | Changelog                                                    | Entrypoint                                                                      |
| -------------------------------------- | -------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `fernapi/fern-typescript-node-sdk`     | `0.11.0`       | [CHANGELOG.md](./generators/typescript/sdk/CHANGELOG.md)     | [cli.ts](./generators/typescript/sdk/cli/src/nodeCli.ts)                        |
| `fernapi/fern-python-sdk`              | `0.9.0`        | [CHANGELOG.md](./generators/python/sdk/CHANGELOG.md)    | [cli.py](./generators/python/src/fern_python/generators/sdk/cli.py)             |
| `fernapi/fern-java-sdk`                | `0.8.0`        | [CHANGELOG.md](./generators/java/sdk/CHANGELOG.md)           | [Cli.java](./generators/java/sdk/src/main/java/com/fern/java/client/Cli.java)   |
| `fernapi/fern-ruby-sdk`                | `0.0.6`        | [CHANGELOG.md](./generators/ruby/sdk/CHANGELOG.md)           | [cli.ts](./generators/ruby/sdk/src/cli.ts)                                      |
| `fernapi/fern-go-sdk`                  | `0.16.0`       | [CHANGELOG.md](./generators/go/sdk/CHANGELOG.md)             | [main.go](./generators/go/cmd/fern-go-sdk/main.go)                              |

### Server-side Generators

Fern's server-side generators output boilerplate application code (models and networking logic). This is intended for spec-first or API-first developers,
who write their API definition (as an OpenAPI spec or Fern definition) and want to generate backend code. Watch a demo [here](https://docs.buildwithfern.com/fern-sd-ks/other-generators/server-side/express-js#demo-video).

| Generator ID                  | Latest Version | Changelog                                                    | Entrypoint                                                                       |
| ----------------------------- | -------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `fernapi/fern-typescript-express` | `0.9.7`        | [CHANGELOG.md](./generators/typescript/express/CHANGELOG.md) | [cli.ts](./generators/typescript/express/cli/src/cli.ts)                         |
| `fernapi/fern-fastapi-server` | `0.7.7`        | [CHANGELOG.md](./generators/python/fastapi/CHANGELOG.md)     | [cli.py](./generators/python/src/fern_python/generators/sdk/cli.py)              |
| `fernapi/fern-java-spring`    | `0.7.1`        | [CHANGELOG.md](./generators/java/spring/CHANGELOG.md)        | [Cli.java](./generators/java/spring/src/main/java/com/fern/java/spring/Cli.java) |

### Model Generators

Fern's model generators will output schemas or types defined in your OpenAPI spec or Fern Definition.

| Generator ID                  | Latest Version | Changelog                                                 | Entrypoint                                                                    |
| ----------------------------- | -------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `fernapi/fern-pydantic-model` | `0.8.0`        | [CHANGELOG.md](./generators/python/pydantic/CHANGELOG.md) | [cli.py](./generators/python/src/fern_python/generators/sdk/cli.py)           |
| `fernapi/fern-java-model`     | `0.7.1`        | [CHANGELOG.md](./generators/java/sdk/CHANGELOG.md)        | [Cli.java](./generators/java/sdk/src/main/java/com/fern/java/client/Cli.java) |
| `fernapi/fern-ruby-model`     | `0.0.6`        | [CHANGELOG.md](./generators/ruby/model/CHANGELOG.md)      | [cli.ts](./generators/ruby/model/src/cli.ts)                                  |

### Spec Generators

Fern's spec generators can output an OpenAPI spec or a Postman collection.

> **Note**: The OpenAPI spec generator is primarly intended for Fern Definition users. This prevents lock-in so that one can always export to OpenAPI.

| Generator ID           | Latest Version | Changelog                                         | Entrypoint                                 |
| ---------------------- | -------------- | ------------------------------------------------- | ------------------------------------------ |
| `fernapi/fern-openapi` | `0.0.30`       | [CHANGELOG.md](./generators/openapi/CHANGELOG.md) | [cli.ts](./generators/openapi/src/cli.ts)  |
| `fernapi/fern-postman` | `0.1.0`        | [CHANGELOG.md](./generators/postman/CHANGELOG.md) | [cli.ts](./generators/postman//src/cli.ts) |

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

## Community

[Join our Discord!](https://discord.com/invite/JkkXumPzcG) We are here to answer questions and help you get the most out of Fern.

## Contributing

We welcome community contributions. For guidelines, refer to our [CONTRIBUTING.md](/CONTRIBUTING.md).

![Fern Contributors](https://contrib.rocks/image?repo=fern-api/fern)
