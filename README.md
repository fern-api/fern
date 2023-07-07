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

Fern is an open source toolkit for designing, building, and consuming REST APIs. With Fern, you can generate client libraries, API documentation and boilerplate for your backend server.

Fern is **fully compatible with OpenAPI.** You can use your existing OpenAPI spec to generate code and documentation with Fern. If you're not a fan of OpenAPI, you can also use Fern's [simpler format](#the-fern-specification) to define your API.

# Capabilities

The Fern compiler can generate the following types of artifacts:

### 🌿 Client Libraries and SDKs

Whether you call them client libraries, SDKs, bindings, or wrappers, Fern generates idiomatic SDKS you can use to interact with your APIs. This makes it trivial to keep your SDKs in sync with your backend, and eliminates the need to write the SDKs manually.

Currently, the following languages are supported:

- [TypeScript](https://github.com/fern-api/fern-typescript)
- [Java](https://github.com/fern-api/fern-java)
- [Python](https://github.com/fern-api/fern-python)
- [Go](https://github.com/fern-api/fern-go)

If you'd like to see a language supported, head over to [the Fern issues page](https://github.com/fern-api/fern/issues) to voice your support!

Fern can also publish your SDKs to registries, like npm and PyPI. See [Publishing clients](#publishing-clients).

### 🌿 Backend Code

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

We have designed Fern to complement existing OpenAPI toolchains and workflows, rather than replace them. We believe OpenAPI does a good job at as a declarative standard for defining APIs, but at times it is too verbose and complex, which harms the quality of automatically generated code.

We've built [our own format](https://buildwithfern.com/docs/definition) that we believe to be easier to work with. Feel free to use either OpenAPI or the Fern specification - the Fern toolchain is fully compatible with both!

If you want to read more about where Fern and OpenAPI differ, read [﻿Fern vs. OpenAPI](https://buildwithfern.com/docs/comparison-with-openapi) for an in-depth comparison.

**TL;DR: we differ from OpenAPI in these areas:**

- [New features in specification](https://www.buildwithfern.com/docs/comparison-with-openapi#new-features-in-specification)
- [Quality of code generation](https://www.buildwithfern.com/docs/comparison-with-openapi#quality-of-code-generation)
- [Focus on server-side API development](https://www.buildwithfern.com/docs/comparison-with-openapi#focus-on-server-side-api-development)
- [Change management](https://www.buildwithfern.com/docs/comparison-with-openapi#change-management)
- [Cloud-based code generation and publishing](https://www.buildwithfern.com/docs/comparison-with-openapi#cloud-based-code-generation-and-publishing)

# Getting Started

The Fern tools are available as a command line interface. To install it, simply run:

```
npm install -g fern-api
```

Once you have installed the Fern CLI, navigate to the root of your repository - or a different folder if you want to keep your SDKs separate from your backend code. You can either initialize a clean workspace using:

```
fern init
```

This will initialize a Fern workspace in the current folder, including the `./fern` directory that Fern will use to hold its resources. This will create roughly the following folder structure in your project:

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

```bash
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

All SDKs are generated server side, so you don't have to worry about installing all the requisite tools locally. Before you can start generating files, you'll need to log in:

```bash
fern login
```

You'll be prompted to log in to your GitHub account using your preferred browser.

After you have logged in, simply run the generate command to generate your SDKs:

```bash
fern generate
```

After your code is generated, the resulting artifacts are copied to the output directory specified in `generators.yml`.

It is possible to generate the code on your own machine by using the `--local` flag. This does require you to run Docker on your local machine, and Fern will schedule containers to do the code generation automatically. This is further specified in the CLI reference below.

## Publishing to Registries


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

## Next Steps

Define _your_ API in Fern. Check out our [Definition Documentation](https://www.buildwithfern.com/docs/definition) to learn more.

# Examples

These are some real world examples of Fern generating documentation and SDKs used in production:

* [Flatfile TypeScript SDK](https://github.com/FlatFilers/flatfile-node)
* [Vellum Python SDK](https://pypi.org/project/vellum-ai/)
* [Vellum Docs](https://docs.vellum.ai/api-reference/generate)
* [Flipt Java SDK](https://github.com/flipt-io/flipt-java)

# CLI Reference

You can run the compiler by running the `generate` command:

```
fern generate [--group <group>] [--version <version>]
```

It will validate your API and run the generators specified in `generators.yml`.

#### Groups

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

This is often useful if you want to generate SDKs for internal use and external use. You can run `fern generate --group internal` on every commit, and `fern generate --group external` when you publish a release.

#### Versions

You can specify a version using the `--version` option. This version string is used when publishing SDKs to registries (e.g. npm).

#### Local Generation

Generation runs in the cloud by default. If you want to run it on your local machine, you can use the `--local` option. This will run each generator in a Docker container.
By default, Fern will delete the container after running. To keep the container around (e.g. to look at the generator's logs), use the `--keepDocker` option.

#### Other Commands

| Command         | Description                                                                                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fern init`     | Initialize a new Fern workspace.                                                                                                                                                                                |
| `fern check`    | Runs validation on the current workspace, ensuring all specifications are valid.                                                                                                                                |
| `fern add`      | Adds a generator to the Fern compiler. You can view the full list of supported generators in our [docs](https://www.buildwithfern.com/docs/compiler/generators).                                                |
| `fern register` | _Advanced feature_ allowing for the registration of dependent APIs, i.e APIs that depend on this API to function. Read more in our [docs](https://www.buildwithfern.com/docs/advanced/depending-on-other-apis). |

## Documentation

Our full documentation can be found [here](https://www.buildwithfern.com/docs).

## Community

[Join our Discord!](https://discord.com/invite/JkkXumPzcG) We are always here to answer questions and help you get the most use out of Fern.

## Contributing

We highly value community contributions. See our [CONTRIBUTING.md](/CONTRIBUTING.md) document for more info on how you can contribute!

## Attribution

Thanks to the folks at [Twemoji](https://twemoji.twitter.com/), an open source project, who created the graphic that we use as our logo.
