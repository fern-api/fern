<br/>
<div align="center">
  <a href="https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern-typescript&utm_content=logo">
    <img src="fern.png" height="120" align="center" alt="header" />
  </a>
  
  <br/>

# TypeScript Generator

[![Contributors](https://img.shields.io/github/contributors/fern-api/fern-typescript.svg)](https://GitHub.com/dotnet/docs/graphs/contributors/)
[![Pulls-opened](https://img.shields.io/github/issues-pr/fern-api/fern-typescript.svg)](https://GitHub.com/dotnet/docs/pulls?q=is%3Aissue+is%3Aopened)
[![Pulls-merged](https://img.shields.io/github/issues-search/fern-api/fern-typescript?label=merged%20pull%20requests&query=is%3Apr%20is%3Aclosed%20is%3Amerged&color=darkviolet)](https://github.com/dotnet/docs/pulls?q=is%3Apr+is%3Aclosed+is%3Amerged)

[![Discord](https://img.shields.io/badge/Join%20Our%20Community-black?logo=discord)](https://discord.com/invite/JkkXumPzcG)

</div>

This repository contains the source for the various generators that produce TypeScript artifacts for [Fern](https://github.com/fern-api/fern):

- `fernapi/fern-typescript-node-sdk`
- `fernapi/fern-typescript-browser-sdk`
- `fernapi/fern-typescript-express`

The TypeScript generators are written in TypeScript. We strongly emphasize idiomatic code generation that feels hand-written and is friendly to read.

Fern handles transforming an API definition -- either an OpenAPI or Fern specification -- into Fern _intermediate representation_. IR is a normalized, Fern-specific definition of an API containing its endpoints, models, errors, authentication scheme, version, and more. Then the TypeScript generator takes over and turns the IR into production-ready code.

## What is Fern?

Fern is an open source toolkit for designing, building, and consuming REST APIs. With Fern, you can generate client libraries, API documentation and boilerplate for your backend server.

Head over to the [official Fern website](https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern-typescript&utm_content=homepage) for more information, or head over to our [Documentation](https://www.buildwithfern.com/docs/intro?utm_source=github&utm_medium=readme&utm_campaign=fern-typescript&utm_content=documentation) to dive straight in and find out what Fern can do for you!

## Generating TypeScript

This generator is used via the [Fern CLI](https://github.com/fern-api/fern), by defining one of the aforementioned TypeScript artifacts as a generator:

```yml
- name: fernapi/fern-typescript-node-sdk
  version: 0.7.1
  output:
    location: npm
    url: npm.buildwithfern.com
    package-name: "@my-org/petstore"
```

By default, Fern runs the generators in the cloud. To run a generator on your local machine, using the `--local` flag for `fern generate`. This will run the generator locally in a Docker container, allowing you to inspect its logs and output. [Read more.](https://buildwithfern.com/docs/compiler/cli-reference#running-locally)

## Configuration

You can customize the behavior of generators through the `generators.yml` file. The Node SDK, Browser SDK, and Express generators support their own set of options, for example, to specify the request timeout duration.

You can specify these options directly when you configure your generators via the `config` object. For example, to instruct the TypeScript Node SDK generator to output a bundle:

```yml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 0.7.1
        config:
          bundle: true
```

### SDK Configuration

The Node SDK and Browser SDK generators support the following options:

| Option                                      | Type                | Description                                                                                                                                 |
| ------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| useBrandedStringAliases                     | `bool`              |                                                                                                                                             |
| private                                     | `bool`              | If specified, generates all code as private members.                                                                                        |
| neverThrowErrors                            | `bool`              | If specified, the generated code will not throw errors.                                                                                     |
| namespaceExport                             | `string`            | If specified, generates all code as part of the specified namespace.                                                                        |
| outputEsm                                   | `bool`              |                                                                                                                                             |
| outputSourceFiles                           | `bool`              | If specified, outputs the source files rather than the TypeScript compiler's output.                                                        |
| includeCredentialsOnCrossOriginRequests     | `bool`              |                                                                                                                                             |
| bundle                                      | `bool`              | If specified, generates a bundle rather than individual source files.                                                                       |
| allowCustomFetcher                          | `bool`              |                                                                                                                                             |
| includeUtilsOnUnionMembers                  | `bool`              |                                                                                                                                             |
| includeOtherInUnionTypes                    | `bool`              |                                                                                                                                             |
| requireDefaultEnvironment                   | `bool`              |                                                                                                                                             |
| timeoutInSeconds                            | `"infinity" \| int` | If specified, sets the request timeout to the specified value. This value must either be the string literal "infinity", or a numeric value. |
| skipResponseValidation                      | `bool`              |                                                                                                                                             |
| extraDependencies                           | `bool`              |                                                                                                                                             |
| treatUnknownAsAny                           | `bool`              | If specified, unknown types are generated as `any`.                                                                                         |
| includeContentHeadersOnFileDownloadResponse | `bool`              |                                                                                                                                             |
| noSerdeLayer                                | `bool`              |                                                                                                                                             |

### Express Configuration

The following options are supported when generating an Express backend:

| Option                        | Type   | Description                                                    |
| ----------------------------- | ------ | -------------------------------------------------------------- |
| useBrandedStringAliases       | `bool` |                                                                |
| areImplementationsOptional    | `bool` | If specified, all implementations are generated as `optional`. |
| doNotHandleUnrecognizedErrors | `bool` |                                                                |
| includeUtilsOnUnionMembers    | `bool` |                                                                |
| includeOtherInUnionTypes      | `bool` |                                                                |
| treatUnknownAsAny             | `bool` | If specified, all unknown types are generated as `any`.        |
| noSerdeLayer                  | `bool` |                                                                |

## Dependencies

The generated TypeScript code has the following dependencies:

- [@ungap/url-search-params](https://www.npmjs.com/package/@ungap/url-search-params)
- [url-join](https://www.npmjs.com/package/url-join)
- [form-data](https://www.npmjs.com/package/form-data)
- [axios](https://www.npmjs.com/package/axios)
- [js-base64](https://www.npmjs.com/package/js-base64)

If you are packaging your code manually, make sure to include them in your `package.json`.

## Releases

All generator releases are published in the [Releases section of the GitHub repository](https://github.com/fern-api/fern-typescript/releases). You can directly use these version numbers in your generator configuration files.

For instance, if you want to use version `0.7.1` of the Node SDK generator:

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

Fern will handle the rest automatically.

## Contributing

We greatly value community contributions. All the work on Fern generators happens right here on GitHub, both Fern developers and community contributors work together through submitting code via Pull Requests. See the contribution guidelines in [CONTRIBUTING](./CONTRIBUTING.md) on how you can contribute to Fern!

<a href="https://github.com/fern-api/fern-typescript/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=fern-api/fern-typescript" />
</a>
