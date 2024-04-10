<br/>
<div align="center">
  <a href="https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern-postman&utm_content=logo">
    <img src="/fern/images/logo-green.png" height="50" align="center" alt="Fern logo" />
  </a>
  
  <br/>

# Postman Generator

[![Contributors](https://img.shields.io/github/contributors/fern-api/fern-postman.svg)](https://GitHub.com/dotnet/docs/graphs/contributors/)
[![Pulls-opened](https://img.shields.io/github/issues-pr/fern-api/fern-postman.svg)](https://GitHub.com/dotnet/docs/pulls?q=is%3Aissue+is%3Aopened)
[![Pulls-merged](https://img.shields.io/github/issues-search/fern-api/fern-postman?label=merged%20pull%20requests&query=is%3Apr%20is%3Aclosed%20is%3Amerged&color=darkviolet)](https://github.com/dotnet/docs/pulls?q=is%3Apr+is%3Aclosed+is%3Amerged)

[![Discord](https://img.shields.io/badge/Join%20Our%20Community-black?logo=discord)](https://discord.com/invite/JkkXumPzcG)

</div>

This repository contains the source for the [Fern](https://buildwithfern.com) generators that produce a Postman Collection:

- `fernapi/fern-postman`

The generator is written in TypeScript and produces a Postman Collection that includes example requests and responses for your endpoints (if they're in your API definition).

Fern handles transforming an API definition -- either an OpenAPI or Fern specification -- into Fern _intermediate representation_. IR is a normalized, Fern-specific definition of an API containing its endpoints, models, errors, authentication scheme, version, and more. Then the Postman generator takes over and turns the IR into a production-ready Postman Collection.

## What is Fern?

Fern is a toolkit for designing, building, and consuming REST APIs. With Fern, you can generate client libraries, API documentation, and boilerplate for your backend server.

Head over to the [official Fern website](https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern-postman&utm_content=homepage) for more information, or head over to our [Documentation](https://www.buildwithfern.com/docs/intro?utm_source=github&utm_medium=readme&utm_campaign=fern-postman&utm_content=documentation) to dive straight in and find out what Fern can do for you!

## Generating a Postman Collection

This generator is used via the [Fern CLI](https://github.com/fern-api/fern) by defining the Postman generator:

```yml
- name: fernapi/fern-postman
  version: 0.0.44
  output:
    location: local-file-system
    path: ../generated/postman
```

By default, Fern runs the generators in the cloud. To run a generator on your local machine, use the `--local` flag for `fern generate`. This will run the generator locally in a Docker container, allowing you to inspect its logs and output. [Read more.](https://buildwithfern.com/docs/compiler/cli-reference#running-locally)

## Versions

Find the latest version number and changelog for this generator in [this Spec Generators table](https://github.com/fern-api/fern?tab=readme-ov-file#spec-generators). The changelog shows earlier version numbers, if any. You can directly use these version numbers in your generator configuration files.

For instance, if you want to use version `0.0.44` of the Postman generator:

```yaml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-postman
        version: 0.0.44
        output:
          location: local-file-system
          path: ../generated/postman
```

Fern will handle the rest automatically.
