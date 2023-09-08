<br/>
<div align="center">
  <a href="https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern-java&utm_content=logo">
    <img src="fern.png" height="120" align="center" alt="header" />
  </a>
  
  <br/>

# Java Generator

[![Contributors](https://img.shields.io/github/contributors/fern-api/fern-java.svg)](https://GitHub.com/dotnet/docs/graphs/contributors/)
[![Pulls-opened](https://img.shields.io/github/issues-pr/fern-api/fern-java.svg)](https://GitHub.com/dotnet/docs/pulls?q=is%3Aissue+is%3Aopened)
[![Pulls-merged](https://img.shields.io/github/issues-search/fern-api/fern-java?label=merged%20pull%20requests&query=is%3Apr%20is%3Aclosed%20is%3Amerged&color=darkviolet)](https://github.com/dotnet/docs/pulls?q=is%3Apr+is%3Aclosed+is%3Amerged)

[![Discord](https://img.shields.io/badge/Join%20Our%20Community-black?logo=discord)](https://discord.com/invite/JkkXumPzcG)

</div>

This repository contains the source for the [Fern]([https://buildwithfern.com](https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern-java&utm_content=repo-contains)) generators that produce Java artifacts:

- `fernapi/fern-java-sdk`
- `fernapi/fern-java-model`
- `fernapi/fern-java-spring`

The generator is written in Java and produces idiomatic code that feels hand-written and is friendly to read.

Fern handles transforming an API definition -- either an OpenAPI or Fern specification -- into Fern _intermediate representation_. IR is a normalized, Fern-specific definition of an API containing its endpoints, models, errors, authentication scheme, version, and more. Then the Java generator takes over and turns the IR into production-ready code.

## What is Fern?

Fern is an open source toolkit for designing, building, and consuming REST APIs. With Fern, you can generate client libraries, API documentation, and boilerplate for your backend server.

Head over to the [official Fern website](https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern-java&utm_content=homepage) for more information, or head over to our [Documentation](https://www.buildwithfern.com/docs/intro?utm_source=github&utm_medium=readme&utm_campaign=fern-java&utm_content=documentation) to dive straight in and find out what Fern can do for you!

## Generating Java

This generator is used via the [Fern CLI](https://github.com/fern-api/fern), by defining one of the aforementioned Java artifacts as a generator:

```yml
- name: fernapi/fern-java-sdk
  version: 0.3.7
  output:
    location: local-file-system
    path: ../../generated/java
```

By default, Fern runs the generators in the cloud. To run a generator on your local machine, use the `--local` flag for `fern generate`. This will run the generator locally in a Docker container, allowing you to inspect its logs and output. [Read more.](https://buildwithfern.com/docs/compiler/cli-reference#running-locally)

## Configuration

You can customize the behavior of generators in `generators.yml`:

```yml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-java-sdk
        version: 0.4.9
        output:
          location: local-file-system
          path: ../../generated/java
```

### SDK Configuration

The Java SDK generator supports the following options:

#### ✨ `unknown-as-optional`

**Type:** boolean

**Default:** `false`

When enabled, unknown types are defined as `Optional<Object>` rather than plain `Object`.

#### ✨ `wrapped-aliases`

**Type:** boolean

**Default:** `false`

When enabled, generates wrapper types for each alias to increase type-safety. For example if you have an alias `ResourceId: string` then if this is true, the generator will generate a ResourceId.java file. If false, it will just treat it as `java.util.String`.

### Spring Configuration

The Java Spring generator supports the following options:

#### ✨ `wrapped-aliases`

**Type:** boolean

**Default:** `false`

When enabled, generates wrapper types for each alias to increase type-safety. For example, if true and you have an alias `ResourceId: string` the generator will generate a ResourceId.java file. If false, it will just treat it as `java.util.String`.

#### ✨ `enable-public-constructors`

**Type:** boolean

**Default:** `false`

When enabled, generates public constructors for model types.

#### ✨ `client-class-name`

**Type:** string

**Default:** `<Organization>ApiClient`

#### ✨ `Custom Dependencies`

**Type:** string

```yaml
custom-dependencies: 
  - "implementation com.foo:bar:0.0.0"
  - "testImplementation com.foo:bar:0.0.0"
  - "api com.foo:bar:0.0.0"
```

The provided string will be used as the client class name. 

## Releases

All generator releases are published in the [Releases section of the GitHub repository](https://github.com/fern-api/fern-java/releases). You can directly use these version numbers in your generator configuration files.

For instance, if you want to use version `0.3.7` of the Java generator:

```yaml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-java-sdk
        version: 0.4.9
        output:
          location: local-file-system
          path: ../../generated/java
```

Fern will handle the rest automatically.

## Contributing

We greatly value community contributions. All the work on Fern generators happens right here on GitHub, both Fern developers and community contributors work together through submitting code via Pull Requests. See the contribution guidelines in [CONTRIBUTING](./CONTRIBUTING.md) on how you can contribute to Fern!

<a href="https://github.com/fern-api/fern-java/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=fern-api/fern-java" />
</a>
