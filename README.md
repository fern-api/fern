<br/>
<div align="center">
  <a href="https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern&utm_content=logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="/fern/images/logo-white.svg">
      <source media="(prefers-color-scheme: light)" srcset="/fern/images/logo-primary.svg">
      <img alt="logo" src="/fern/images/logo-primary.svg" height="80" align="center">
    </picture>
  </a>
<br/>

<br/>

[![2023 Y Combinator Startup](https://img.shields.io/badge/Y%20Combinator-2023-orange)](https://www.ycombinator.com/companies/fern)
![License](https://img.shields.io/badge/license-Apache%202.0-blue)

[![Slack](https://img.shields.io/badge/slack-pink.svg)](https://join.slack.com/t/fern-community/shared_invite/zt-2dpftfmif-MuAegl8AfP_PK8s2tx350Q)
[![Documentation](https://img.shields.io/badge/Read%20our%20Documentation-black?logo=book)](https://buildwithfern.com/learn/home?utm_source=fern-api/fern/readme-read-our-documentation)

</div>

Fern helps API providers deliver a better developer experience by automatically generating SDKs and interactive API documentation directly from your OpenAPI specification (or Fern's own [Fern Definition](https://buildwithfern.com/learn/api-definition/fern/overview)). With Fern, you make your APIs easier to adopt and use, and enable your developer customers to integrate faster and more smoothly.

Core benefits:

- **Generate SDKs instantly:** Quickly create consistent, high-quality SDKs in multiple languages.

- **Interactive API documentation:** Provide clear, interactive documentation tailored to your brand.

- **Improved developer experience:** Reduce integration friction and accelerate developer adoption by offering SDKs and documentation designed for ease of use.

- **Maintain API consistency:** Keep SDKs and documentation in sync automatically as your API evolves.

Fern simplifies your publishing workflow, allowing you to focus on building great APIs while Fern handles SDK and documentation generation.



<div align="center">
    <a href="/fern/images/overview-dark.png" target="_blank">
        <picture>
            <source srcset="/fern/images/overview-dark.png" media="(prefers-color-scheme: dark)">
            <source srcset="/fern/images/overview-light.png" media="(prefers-color-scheme: light)">
            <img src="/fern/images/overview-light.png" width="700" alt="Overview Diagram">
        </picture>
    </a>
</div>

## 🌿 SDKs

Fern uses your OpenAPI definition to create SDKs in multiple languages. 
Follow these steps to generate a TypeScript SDK using Fern.

### 1. Install Fern CLI

Fern requires Node.js version 18 or later. To install Fern globally, run this in your terminal:

```bash
npm install -g fern-api
```

### 2. Initialize Fern with your OpenAPI document

Link your existing OpenAPI document (.yml or .json) to Fern:

```bash
fern init --openapi ./path/to/openapi.yml
```

Or use an OpenAPI document from a URL:

```bash
fern init --openapi https://link.buildwithfern.com/plantstore-openapi
```

Fern creates configuration files and a project directory:

```yaml
fern/
  ├─ fern.config.json   # General configuration for your Fern project
  └─ api/               # Your API
     ├─ generators.yml  # Generators you're using
     └─ openapi/
        └─ openapi.yml  # Your provided OpenAPI document
```

### 3. Check your Fern configuration

Make sure your API definition and configuration are correct by running:

```bash
fern check
```

Resolve any errors before proceeding.

### 4. Add a TypeScript SDK generator

To create a TypeScript SDK, run:

```bash
fern add fern-typescript-node-sdk --group sdk
```

Fern [supports multiple languages](https://buildwithfern.com/learn/sdks/introduction/language-support) you can use.

### 5. Generate the SDK

To generate the SDK, run:

```bash
fern generate --group sdk
```

Fern outputs your SDK into this folder:


```yaml
sdks/
  typescript/
    src/
      ├─ index.ts
      ├─ Client.ts
      ├─ api/
      ├─ errors/
      └─ serialization/
```

## 🌿 API Documentation

Fern can build interactive API documentation from an OpenAPI document. Follow these steps to build and publish interactive API documentation using Fern.

### 1. Install Fern CLI
  
Fern needs Node.js version 18 or newer. To install Fern, open a terminal and run:

```bash
npm install -g fern-api
```

### 2. Set up Fern documentation

In your project directory, run:

```bash
fern init --docs
```

Fern prompts you to enter your organization's name. After setup, your directory should look like this:

```yaml
fern/
  ├─ fern.config.json # General configuration for your Fern project
  └─ docs.yml         # Your docs configuration file
```

### 3. Add your OpenAPI document

Create an `api` folder inside the `fern` folder. Move your OpenAPI document (`.yml` or `.json`) into it:

```yaml
fern/
  ├─ fern.config.json         # General configuration for your Fern project
  ├─ docs.yml                 # Your docs configuration file
  └─ api/            
    └─ open-api-document.yml  # Your OpenAPI document
```

You can also store the OpenAPI document outside your Fern project, but for example sake we have it in the project.

### 4. Link your OpenAPI document to Fern

Run this command to link your OpenAPI document with Fern:

```bash
fern init --openapi ./fern/api/open-api-document.yml
```

### 5. Preview your documentation

To preview your documentation locally, run:

```bash
fern docs dev
```

Visit [http://localhost:3000/](http://localhost:3000/) to see your documentation site.

### 6. Publish your documentation

When you're ready to publish, run:

```bash
fern generate --docs
```

Fern asks you to log in and then publishes your site.

## Example sites

The following are some example documentation sites built with Fern:

- [docs.vellum.ai](https://docs.vellum.ai)
- [docs.superagent.sh](https://docs.superagent.sh/)
- [docs.hume.ai](https://docs.hume.ai/)
- [docs.deepgram.com](https://docs.deepgram.com/)

Get started [here](https://github.com/fern-api/docs-starter-openapi).

## 🌿 Generators

Generators are process that take your API Definition as input and output artifacts (SDKs,
Postman Collections, Server boilerplate, etc.). To add a generator run `fern add <generator id>`

### SDK Generators

| Generator ID                       | Latest Version                                                                                    | Entrypoint                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `fernapi/fern-typescript-node-sdk` | ![Typescript Generator Version](https://img.shields.io/docker/v/fernapi/fern-typescript-node-sdk) | [cli.ts](./generators/typescript/sdk/cli/src/nodeCli.ts)                      |
| `fernapi/fern-python-sdk`          | ![Python Generator Version](https://img.shields.io/docker/v/fernapi/fern-python-sdk)              | [cli.py](./generators/python/src/fern_python/generators/sdk/cli.py)           |
| `fernapi/fern-java-sdk`            | ![Java Generator Version](https://img.shields.io/docker/v/fernapi/fern-java-sdk)                  | [Cli.java](./generators/java/sdk/src/main/java/com/fern/java/client/Cli.java) |
| `fernapi/fern-ruby-sdk`            | ![Ruby Generator Version](https://img.shields.io/docker/v/fernapi/fern-ruby-sdk)                  | [cli.ts](./generators/ruby/sdk/src/cli.ts)                                    |
| `fernapi/fern-go-sdk`              | ![Go Generator Version](https://img.shields.io/docker/v/fernapi/fern-go-sdk)                      | [main.go](./generators/go/cmd/fern-go-sdk/main.go)                            |
| `fernapi/fern-csharp-sdk`          | ![C# Generator Version](https://img.shields.io/docker/v/fernapi/fern-csharp-sdk)                  | [cli.ts](./generators/csharp/sdk/src/cli.ts)                                  |
| `fernapi/fern-php-sdk`             | ![PHP Generator Version](https://img.shields.io/docker/v/fernapi/fern-php-sdk)                    | [cli.ts](./generators/php/sdk/src/cli.ts)                                     |

### Server-side Generators

Fern's server-side generators output boilerplate application code (models and networking logic). This is intended for spec-first or API-first developers, who write their API definition (as an OpenAPI spec or Fern definition) and want to generate backend code.

| Generator ID                      | Latest Version                                                                                                  | Entrypoint                                                                       |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `fernapi/fern-typescript-express` | ![Typescript Express Server Generator Version](https://img.shields.io/docker/v/fernapi/fern-typescript-express) | [cli.ts](./generators/typescript/express/cli/src/cli.ts)                         |
| `fernapi/fern-fastapi-server`     | ![Python FastAPI Server Generator Version](https://img.shields.io/docker/v/fernapi/fern-fastapi-server)         | [cli.py](./generators/python/src/fern_python/generators/sdk/cli.py)              |
| `fernapi/fern-java-spring`        | ![Java Spring Server Generator Version](https://img.shields.io/docker/v/fernapi/fern-java-spring)               | [Cli.java](./generators/java/spring/src/main/java/com/fern/java/spring/Cli.java) |

### Model Generators

Fern's model generators will output schemas or types defined in your OpenAPI spec or Fern Definition.

| Generator ID                  | Latest Version                                                                                   | Entrypoint                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `fernapi/fern-pydantic-model` | ![Pydantic Model Generator Version](https://img.shields.io/docker/v/fernapi/fern-pydantic-model) | [cli.py](./generators/python/src/fern_python/generators/sdk/cli.py)           |
| `fernapi/java-model`          | ![Java Model Generator Version](https://img.shields.io/docker/v/fernapi/java-model)              | [Cli.java](./generators/java/sdk/src/main/java/com/fern/java/client/Cli.java) |
| `fernapi/fern-ruby-model`     | ![Ruby Model Generator Version](https://img.shields.io/docker/v/fernapi/fern-ruby-model)         | [cli.ts](./generators/ruby/model/src/cli.ts)                                  |
| `fernapi/fern-go-model`       | ![Go Model Generator Version](https://img.shields.io/docker/v/fernapi/fern-go-model)             | [main.go](./generators/go/cmd/fern-go-model/main.go)                          |

### Spec Generators

Fern's spec generators can output an OpenAPI spec or a Postman collection.

> **Note**: The OpenAPI spec generator is primarily intended for Fern Definition users. This prevents lock-in so that one can always export to OpenAPI.

| Generator ID           | Latest Version                                                                     | Entrypoint                                |
| ---------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------- |
| `fernapi/fern-openapi` | ![OpenAPI Generator Version](https://img.shields.io/docker/v/fernapi/fern-openapi) | [cli.ts](./generators/openapi/src/cli.ts) |
| `fernapi/fern-postman` | ![Postman Generator Version](https://img.shields.io/docker/v/fernapi/fern-postman) | [cli.ts](./generators/postman/src/cli.ts) |

## 🌿 CLI Commands

Here's a quick look at the most popular CLI commands. View the documentation for [all CLI commands](https://buildwithfern.com/learn/cli-api/cli-reference/commands).

- `fern init`: adds a new starter API to your repository.

- `fern check`: validate your API definition and Fern configuration.

- `fern generate`: run the generators specified in `generators.yml` in the cloud.

- `fern generate --local`: run the generators specified in `generators.yml` in docker locally.

- `fern add <generator>`: include a new generator in your `generators.yml`. For example, `fern add fern-python-sdk`.

## Advanced

### API First

Fern supports developers and teams that want to be API-first or Spec-first.

Define your API, and use Fern to generate models, networking code and boilerplate application code. The generated code adds
type safety to your API implementation - if your backend doesn't implement the API correctly, it won't compile.

Frameworks currently supported:

- [Express](./generators/typescript)
- [Spring Boot](./generators/java)
- [FastAPI](./generators/python)

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

## Inspiration

Fern is inspired by internal tooling built to enhance the developer experience. We stand on the shoulders of giants. While teams were responsible for building the following tools, we want to give a shout out to Mark Elliot (creator of Conjure at Palantir), Michael Dowling (creator of Smithy at AWS), and Ian McCrystal (creator of Stripe Docs).

## Community

[Join our Discord!](https://discord.com/invite/JkkXumPzcG) We are here to answer questions and help you get the most out of Fern.

## Contributing

We welcome community contributions. For guidelines, refer to our [CONTRIBUTING.md](/CONTRIBUTING.md).

![Fern Contributors](https://contrib.rocks/image?repo=fern-api/fern)
