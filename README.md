<br/>
<div align="center">
  <a href="https://www.buildwithfern.com/">
    <img src="fern.png" height="120" align="center" alt="header" />
  </a>
  <br/>

# Fern

![YC](https://img.shields.io/badge/Y%20Combinator-2023-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

[![Discord](https://img.shields.io/badge/Join%20Our%20Community-black?logo=discord)](https://discord.com/invite/JkkXumPzcG)
[![Documentation](https://img.shields.io/badge/Read%20our%20Documentation-black?logo=book)](https://www.buildwithfern.com/docs/intro)

</div>

Fern is an open source toolkit for designing, building, and consuming REST APIs. With Fern, you can generate client libraries, API documentation, and boilerplate for your backend server.

Fern is **fully compatible with OpenAPI.** You can use your existing OpenAPI spec to generate code and documentation with Fern. If you're not a fan of OpenAPI, you can also use Fern's [simpler format](#the-fern-specification) to define your API.

# Capabilities

The Fern CLI can generate the following types of artifacts:

### 🌿 Client libraries & SDKs

Whether you call them client libraries, SDKs, bindings, or wrappers, Fern generates idiomatic SDKs you can use to interact with your APIs. This makes it trivial to keep your SDKs in sync with your backend, and eliminates the need to write the SDKs manually.

Currently, the following languages are supported:

- [TypeScript](https://github.com/fern-api/fern-typescript)
- [Java](https://github.com/fern-api/fern-java)
- [Python](https://github.com/fern-api/fern-python)
- [Go](https://github.com/fern-api/fern-go)

If you'd like to see a language supported, head over to [the Fern issues page](https://github.com/fern-api/fern/issues) to voice your support!

Fern can also publish your SDKs to registries, like npm and PyPI. See [Publishing clients](#publishing-clients).

### 🌿 Backend code

Define your API, and Fern will generate models, networking code and boilerplate application code. The generated code adds type safety to your API implementation - if your backend doesn't implement the API correctly, it won't compile.

Fern currently supports:

- [Express](https://github.com/fern-api/fern-typescript)
- [Spring Boot](https://github.com/fern-api/fern-java)
- [FastAPI](https://github.com/fern-api/fern-python)

For a walkthrough, check out the [Fern + Express video](https://buildwithfern.com/docs/showcase/express).

### 🌿 Documentation

Fern provides first class support for generating documentation, ranging from [fully featured documentation websites](https://docs.vellum.ai/api-reference/generate) to Postman Collections. This allows you to always keep your documentation, API and Postman collections in sync with ease.

Generating API documentation is part of our cloud offering. If you're interested in trying out this service, [get in touch!](mailto:hey@buildwithfern.com)

## Fern and OpenAPI

We have designed Fern to complement existing OpenAPI toolchains and workflows, rather than replace them. We believe OpenAPI does a good job at as a declarative standard for defining APIs, but at times it is too verbose and complex, which reduces the quality of generated code.

We've built [our own format](https://buildwithfern.com/docs/definition) that we believe to be easier to work with. Feel free to use either OpenAPI or the Fern specification - the Fern toolchain is fully compatible with both!

If you want to read more about how the Fern specification and OpenAPI differ, read [﻿Fern vs. OpenAPI](https://buildwithfern.com/docs/comparison-with-openapi) for an in-depth comparison.

# Getting Started

_Note: Fern requires **Node 18** or higher_

The Fern tools are available as a command line interface. To install it, simply run:

```
npm install -g fern-api
```

To create a starter project, navigate to the root of your repository and run:

```
fern init
```

This will initialize a Fern workspace in the current folder, including the `./fern` directory that Fern will use to hold its resources.

_Note: to initialize a starter project from an existing OpenAPI spec, see [Starting from OpenAPI](#starting-from-openapi)._

This will create the following folder structure in your project:

```yaml
fern/
├─ fern.config.json # root-level configuration
└─ api/ # your API
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

### Starting from OpenAPI

If you have an existing OpenAPI definition, you can use that as your starting point by specifying the `--openapi` option:

```bash
fern init --openapi ./path/to/openapi.yml
# or
fern init --openapi https://petstore.swagger.io/v2/swagger.json
```

This will generate an OpenAPI-based Fern project:

```yaml
fern/
├─ fern.config.json # root-level configuration
└─ api/ # your API
  ├─ generators.yml # generators you're using
  └─ openapi/
    └─ openapi.yml # your openapi spec
```

## Adding Generators

You can add generators using the `fern add` command. You can have multiple generators for a single project, e.g. you may want to generate SDKs in Python, TypeScript and Java.

For instance, if you'd like to add a Node SDK generator to your project, simply run:

```
fern add fern-typescript-node-sdk
```

Your `generators.yml` file should contain the new generator:

```yaml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 0.7.1
        output:
          location: local-file-system
          path: ../../generated/typescript
```

See [Generators](https://buildwithfern.com/docs/compiler/generators) for the full list of available generators.

## Generating Code

By default, all code is generated in the cloud, so you don't have to worry about installing all the requisite tools locally. Before you can start generating files, you'll need to log in:

```
fern login
```

You'll be prompted to log in to your GitHub account using your preferred browser.

After you have logged in, simply run the generate command to generate your SDKs:

```
fern generate
```

After your code is generated, the resulting artifacts are copied to the output directory specified in `generators.yml`.

### Running the generators locally

It is possible to generate the code on your own machine by using the `--local` flag. Just make sure you have Docker running!

## Publishing SDKs to registries

Fern supports automatically publishing clients to registries, like Fern's npm or PyPI registries.

```yaml
- name: fernapi/fern-typescript-node-sdk
  version: 0.7.1
  output:
    location: npm
    url: npm.buildwithfern.com
    package-name: "@my-org/petstore"
```

Running `fern generate` will generate your SDK and publish it to the specified registry.

You can also publish to public registries (like npmjs.com) as part of our cloud offering. If you're interested in trying out this service, [get in touch!](mailto:hey@buildwithfern.com).

# Examples

These are some real world examples of Fern generating documentation and SDKs used in production:

- [Flatfile TypeScript SDK](https://github.com/FlatFilers/flatfile-node)
- [Vellum Python SDK](https://pypi.org/project/vellum-ai/)
- [Vellum Docs](https://docs.vellum.ai/api-reference/generate)
- [Flipt Java SDK](https://github.com/flipt-io/flipt-java)

# CLI Reference

## `fern generate`

```
fern generate [--group <group>] [--version <version>] [--local [--keepDocker]]
```

This will validate your API and run the generators specified in `generators.yml`.

`--group`

In `genrators.yml`, you can split up your generators into groups.

```yaml
groups:
  internal:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        ...
  external:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        ...
```

This is often useful if you want to generate SDKs for internal use and external use. You can run `fern generate --group internal` on every commit, and `fern generate --group external` when you cut a release.

`--version`

You can specify a version using the `--version` option. This version string is used when publishing SDKs to registries (e.g. npm).

`--local`

Generation runs in the cloud by default. If you want to run it on your local machine, you can use the `--local` option. This will run each generator in a Docker container.
By default, Fern will delete the container after running. To keep the container around (e.g. to look at the generator's logs), use the `--keepDocker` option.

## `fern init`

```
fern init [--openapi <openapi spec>]
```

This will initialize a new Fern project with a default Fern specification.

`--openapi`

If you specify a path or URL to an OpenAPI spec, Fern will initialize an OpenAPI workspace.

## `fern check`

```
fern check
```

This will validate that your workspace is set up correctly and that your API definition is valid.

## Documentation

Our full documentation can be found [here](https://www.buildwithfern.com/docs). To edit our documentation
see [CONTRIBUTING.md](./CONTRIBUTING.md#writing-documentation).

## Community

[Join our Discord!](https://discord.com/invite/JkkXumPzcG) We are here to answer questions and help you get the most out of Fern.

## Contributing

We highly value community contributions. See our [CONTRIBUTING.md](/CONTRIBUTING.md) document for more info on how you can contribute!

![Fern Contributors](https://contrib.rocks/image?repo=fern-api/fern)

## Attribution

Thanks to the folks at [Twemoji](https://twemoji.twitter.com/), an open source project, who created the graphic that we use as our logo.
