<br/>
<div align="center">
  <a href="https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern-typescript&utm_content=logo">
    <img src="fern.png" height="120" align="center" alt="header" />
  </a>

  <br/>

# Python Generator

[![Contributors](https://img.shields.io/github/contributors/fern-api/fern-python.svg)](https://GitHub.com/dotnet/docs/graphs/contributors/)
[![Pulls-opened](https://img.shields.io/github/issues-pr/fern-api/fern-python.svg)](https://GitHub.com/dotnet/docs/pulls?q=is%3Aissue+is%3Aopened)
[![Pulls-merged](https://img.shields.io/github/issues-search/fern-api/fern-python?label=merged%20pull%20requests&query=is%3Apr%20is%3Aclosed%20is%3Amerged&color=darkviolet)](https://github.com/dotnet/docs/pulls?q=is%3Apr+is%3Aclosed+is%3Amerged)

[![Discord](https://img.shields.io/badge/Join%20Our%20Community-black?logo=discord)](https://discord.com/invite/JkkXumPzcG)

</div>

This repository contains the source for the various generators that produce Python artifacts for [Fern](https://github.com/fern-api/fern):

- `fernapi/fern-python-sdk`
- `fernapi/fern-pydandic-model`
- `fernapi/fern-fastapi-server`

The Python generators are written in Python. We strongly emphasize idiomatic code generation that feels hand-written and is friendly to read.

Fern handles transforming an API definition -- either an OpenAPI or Fern specification -- into Fern _intermediate representation_. IR is a normalized, Fern-specific definition of an API containing its endpoints, models, errors, authentication scheme, version, and more. Then the Python generator takes over and turns the IR into production-ready code.

## What is Fern?

Fern is an open source toolkit for designing, building, and consuming REST APIs. With Fern, you can generate client libraries, API documentation, and boilerplate for your backend server.

Head over to the [official Fern website](https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern-python&utm_content=homepage) for more information, or head over to our [Documentation](https://www.buildwithfern.com/docs/intro?utm_source=github&utm_medium=readme&utm_campaign=fern-python&utm_content=documentation) to dive straight in and find out what Fern can do for you!

## Generating Python

This generator is used via the [Fern CLI](https://github.com/fern-api/fern), by defining one of the aforementioned Python artifacts as a generator:

```yml
- name: fernapi/fern-python-sdk
  version: 0.6.6
  output:
    location: local-file-system
    path: ../generated/python
```

By default, Fern runs the generators in the cloud. To run a generator on your local machine, using the `--local` flag for `fern generate`. This will run the generator locally in a Docker container, allowing you to inspect its logs and output. [Read more.](https://buildwithfern.com/docs/compiler/cli-reference#running-locally)

## Configuration

You can customize the behavior of generators in `generators.yml`:

```yml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-python
      version: 0.6.6
      config: # <--
        include_validators: true
```

### SDK Generator Configuration

The Python SDK generator supports the following options:

#### ✨ `timeout_in_seconds`

**Type:** integer

**Default:** 60

By default, the generator generates a client that times out after 60 seconds.
You can customize this value by providing a different number or setting to `infinity`
to get rid of timeouts.

#### ✨ `client_class_name`

**Type:** boolean

**Default:** `{organization}{api-name}`

By default, the generator will concatenate your organization and API name to generate the
name of the client class. You can customize it by overriding this value.

#### ✨ `skip_formatting`

**Type:** boolean

**Default:** `true`

#### ✨ `pydantic_config.include_union_utils`

**Type:** boolean

**Default:** `False`

When enabled, the generator will output a Pydantic `__root__` class that will contain
utilities to visit the union. For example, for the following union type:

```yaml
types:
  Shape:
    union:
      circle: Circle
      triangle: Triangle
```

you will get a generated `Shape` class that has a factory and visitor

```python

# Use a factory to instantiate the union
Shape.factory.circle(Circle(...))

# Visit every case in the union
shape = get_shape()
shape.visit(
  circle: lambda circle: do_something_with_circle(circle),
  triangle: lambda triangle: do_something_with_circle(circle),
)
```

When enabled, the python generator will not run Black formatting in the generated code.
Black is slow so this can potentially speed up code generation quite a bit.

#### ✨ `pydantic_config.wrapped_aliases`

**Type:** boolean

**Default:** `false`

When enabled, any alias types defined in your Fern Definition will be generated
as an individual class.

#### ✨ `pydantic_config.version`

**Type:** "v1" or "v2" or "both"

**Default:** "both"

By default, the generator generates pydantic models that are v1 and v2 compatible.
However you can override them to strictly for v1 or v2.

```
config:
  pydantic_config:
    version: v1 # or v2 or "both"
```

### FastAPI Generator Configuration

The FastAPI generator supports the following options:

#### ✨ `pydantic_config.version`

**Type:** "v1" or "v2" or "both"

**Default:** "both"

By default, the generator generates pydantic models that are v1 and v2 compatible.
However you can override them to strictly for v1 or v2.

```
config:
  pydantic_config:
    version: v1 # or v2 or "both"
```

### Pydantic Generator Configuration

The Pydantic generator supports the following options:

#### ✨ `version`

**Type:** "v1" or "v2" or "both"

**Default:** "both"

By default, the generator generates pydantic models that are v1 and v2 compatible.
However you can override them to strictly for v1 or v2.

```
config:
  version: v1 # or v2 or "both"
```

## Releases

All generator releases are published in the [Releases section of the GitHub repository](https://github.com/fern-api/fern-python/releases). You can directly use these version numbers in your generator configuration files.

For instance, if you want to use version `0.3.7` of the Python generator:

```yaml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-python
        version: 0.3.7 # <--- generator version
        output:
          location: local-file-system
          path: ../generated/python
```

Fern will handle the rest automatically.

## Contributing

We greatly value community contributions. All the work on Fern generators happens right here on GitHub, both Fern developers and community contributors work together through submitting code via Pull Requests. See the contribution guidelines in [CONTRIBUTING](./CONTRIBUTING.md) on how you can contribute to Fern!

<a href="https://github.com/fern-api/fern-python/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=fern-api/fern-python" />
</a>
