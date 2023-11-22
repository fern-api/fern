<br/>
<div align="center">
  <a href="https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern-python&utm_content=logo">
    <img src="fern.png" height="120" align="center" alt="header" />
  </a>
  
  <br/>

=======
Generate Python models, clients, and server interface from your Fern API Definition.

[![Contributors](https://img.shields.io/github/contributors/fern-api/fern-python.svg)](https://GitHub.com/dotnet/docs/graphs/contributors/)
[![Pulls-opened](https://img.shields.io/github/issues-pr/fern-api/fern-python.svg)](https://GitHub.com/dotnet/docs/pulls?q=is%3Aissue+is%3Aopened)
[![Pulls-merged](https://img.shields.io/github/issues-search/fern-api/fern-python?label=merged%20pull%20requests&query=is%3Apr%20is%3Aclosed%20is%3Amerged&color=darkviolet)](https://github.com/dotnet/docs/pulls?q=is%3Apr+is%3Aclosed+is%3Amerged)

[![Discord](https://img.shields.io/badge/Join%20Our%20Community-black?logo=discord)](https://discord.com/invite/JkkXumPzcG)

</div>

This repository contains the source for the [Fern](https://buildwithfern.com) generator that produces Python artifacts. The generator is written in Python, and produces idiomatic code that feels hand-written and is friendly to read.

Fern handles transforming an API definition -- either an OpenAPI or Fern specification -- into Fern _intermediate representation_. IR is a normalized, Fern-specific definition of an API containing its endpoints, models, errors, authentication scheme, version, and more. Then the Python generator takes over and turns the IR into production-ready code.

## What is Fern?

Fern is an open source toolkit for designing, building, and consuming REST APIs. With Fern, you can generate client libraries, API documentation, and boilerplate for your backend server.

Head over to the [official Fern website](https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern-python&utm_content=homepage) for more information, or head over to our [Documentation](https://www.buildwithfern.com/docs/intro?utm_source=github&utm_medium=readme&utm_campaign=fern-python&utm_content=documentation) to dive straight in and find out what Fern can do for you!

## Generating Python

This generator is used via the [Fern CLI](https://github.com/fern-api/fern), by defining one of the aforementioned Python artifacts as a generator:

```yml
- name: fernapi/fern-python
  version: 0.3.7
  output:
    location: local-file-system
    path: ../../generated/python
```

By default, Fern runs the generators in the cloud. To run a generator on your local machine, using the `--local` flag for `fern generate`. This will run the generator locally in a Docker container, allowing you to inspect its logs and output. [Read more.](https://buildwithfern.com/docs/compiler/cli-reference#running-locally)

## Dependencies

The generated Python code has the following dependencies:

- [Python Poetry](https://python-poetry.org/docs/#installing-with-the-official-installer)

After you have installed Poetry:

1. `poetry --local config virtualenvs.in-project true`
2. `poetry install`
3. `poetry shell`
4. `code .`

To check types: `poetry run mypy`

## Configuration

You can customize the behavior of generators in `generators.yml`:

```yml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-python
      version: 0.3.7
      config: # <--
        include_validators: true
```

### SDK Configuration

The Python SDK supports the following options:

#### ✨ `include_validators`

**Type:** boolean

**Default:** `false`

When enabled, includes validators in the generated code.

#### ✨ `forbid_extra_fields`

**Type:** boolean

**Default:** `false`

When enabled, forbids the extra fields.

#### ✨ `wrapped_aliases`

**Type:** boolean

**Default:** `false`

When enabled, an alias wraps the underlying class.

#### ✨ `skip_formatting`

**Type:** boolean

**Default:** `false`

When enabled, skips formatting.

#### ✨ `include_union_utils`

**Type:** boolean

**Default:** `false`

When enabled, the generated code will include union utilities.

#### ✨ `frozen`

**Type:** boolean

**Default:** `false`

#### ✨ `orm_mode`

**Type:** boolean

**Default:** `false`

## Releases

All generator releases are published in the [Releases section of the GitHub repository](https://github.com/fern-api/fern-python/releases). You can directly use these version numbers in your generator configuration files.

For instance, if you want to use version `0.3.7` of the Python generator:

```yaml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-python
        version: 0.3.7
        output:
          location: local-file-system
          path: ../../generated/python
```

Fern will handle the rest automatically.

## Contributing

We greatly value community contributions. All the work on Fern generators happens right here on GitHub, both Fern developers and community contributors work together through submitting code via Pull Requests. See the contribution guidelines in [CONTRIBUTING](./CONTRIBUTING.md) on how you can contribute to Fern!

<a href="https://github.com/fern-api/fern-python/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=fern-api/fern-python" />
</a>
