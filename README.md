<br/>
<div align="center">
  <a href="https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern-openapi&utm_content=logo">
    <img src="fern.png" height="120" align="center" alt="header" />
  </a>
  
  <br/>

# OpenAPI Generator

[![Contributors](https://img.shields.io/github/contributors/fern-api/fern-openapi.svg)](https://GitHub.com/dotnet/docs/graphs/contributors/)
[![Pulls-opened](https://img.shields.io/github/issues-pr/fern-api/fern-openapi.svg)](https://GitHub.com/dotnet/docs/pulls?q=is%3Aissue+is%3Aopened)
[![Pulls-merged](https://img.shields.io/github/issues-search/fern-api/fern-openapi?label=merged%20pull%20requests&query=is%3Apr%20is%3Aclosed%20is%3Amerged&color=darkviolet)](https://github.com/dotnet/docs/pulls?q=is%3Apr+is%3Aclosed+is%3Amerged)

[![Discord](https://img.shields.io/badge/Join%20Our%20Community-black?logo=discord)](https://discord.com/invite/JkkXumPzcG)

</div>

The OpenAPI specification, or OAS, defines a standard, language-agnostic interface to HTTP APIs which allows both humans and computers to discover and understand the capabilities of the service.

This repository contains the source for the [Fern](https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern-openapi&utm_content=repo-contains) generator that produces an OpenAPI specification:

- `fernapi/fern-openapi`

The generator is written in TypeScript and produces an OpenAPI `3.0.0` specification. If you have a need for Fern to generate a more recent specification version, let us know in [this issue](https://github.com/fern-api/fern-openapi/issues/65).

Fern handles transforming a Fern specification into Fern _intermediate representation_. IR is a normalized, Fern-specific definition of an API containing its endpoints, models, errors, authentication scheme, version, and more. Then the OpenAPI generator takes over and turns the IR into a production-ready OpenAPI specification.

## What is Fern?

Fern is an open source toolkit for designing, building, and consuming REST APIs. With Fern, you can generate client libraries, API documentation, and boilerplate for your backend server.

Head over to the [official Fern website](https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern-openapi&utm_content=homepage) for more information, or head over to our [Documentation](https://www.buildwithfern.com/docs/intro?utm_source=github&utm_medium=readme&utm_campaign=fern-openapi&utm_content=documentation) to dive straight in and find out what Fern can do for you!

## Generating an OpenAPI specification

This generator is used via the [Fern CLI](https://github.com/fern-api/fern) by defining the OpenAPI generator:

```yml
- name: fernapi/openapi
  version: 0.0.28
  output:
    location: local-file-system
    path: ../../generated/openapi
```

By default, Fern runs the generators in the cloud. To run a generator on your local machine, use the `--local` flag for `fern generate`. This will run the generator locally in a Docker container, allowing you to inspect its logs and output. [Read more.](https://buildwithfern.com/docs/compiler/cli-reference#running-locally)

## Configuration

You can customize the behavior of generators in `generators.yml`:

```yml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-openapi
        version: 0.0.27
        config: # <--
          format: json
```

#### ✨ `format`

**Type:** enum<string>: 'json' | 'yaml'

**Default:** `yaml`

When configured, the generator outputs OAS files in the specified format.

#### ✨ `customOverrides`

**Type:** object

**Default:** {}

When configured, the object is merged into the generated OAS file. This allows you to add custom fields to the specification.

## Releases

All generator releases are published in the [Releases section of the GitHub repository](https://github.com/fern-api/fern-openapi/releases). You can directly use these version numbers in your generator configuration files.

For instance, if you want to use version `0.0.27` of the OpenAPI generator:

```yaml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-openapi
        version: 0.0.27
        output:
          location: local-file-system
          path: ../../generated/openapi
```

Fern will handle the rest automatically.

## Contributing

We greatly value community contributions. All the work on Fern generators happens right here on GitHub, both Fern developers and community contributors work together through submitting code via Pull Requests. See the contribution guidelines in [CONTRIBUTING](./CONTRIBUTING.md) on how you can contribute to Fern!

<a href="https://github.com/fern-api/fern-openapi/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=fern-api/fern-openapi" />
</a>
