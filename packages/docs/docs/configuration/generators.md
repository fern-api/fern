---
title: generators.yml
---

`generators.yml` is a file where you set configuration for which code generators you will use.

## How code generation works

A code generator reads in your **Fern Definition** and outputs code. The outputted code is either published to a registry or downloaded locally within your project. Code generators run remotely in the cloud.

By default, `generators.yml` starts with two empty lists: `draft` and `release`.

```yml
# generators.yml
draft: []
release: []
```

Here's an example [using multiple generators](https://github.com/fern-api/fern-examples/blob/main/fern/api/generators.yml).

## Draft

Generators in the `draft` list are used when you're editing your API. By default, the generated code is published to a private registry managed by Fern.

[Add a generator](../cli/add.md) using the CLI. For example, when we add the `typescript` generator using `fern add typescript`:

```diff
# generators.yml
draft:
+ - name: fernapi/typescript
+   version: 0.0.xxx
+   config:
+     mode: client_and_server
release: []
```

You can also configure your generators to download the code locally. To do this, use `output-directory`:

```diff
# generators.yml
draft:
  - name: fernapi/typescript
    version: 0.0.xxx
+   output-directory: path/to/generated # path is relative to your project's root
    config:
      mode: client_and_server
release: []
```

You can also disable publishing the generated code to Fern's private registries:

```diff
# generators.yml
draft:
  - name: fernapi/typescript
    version: 0.0.xxx
    # output directory is relative to your project's root
    output-directory: path/to/generated
+   publish-to-fern-registry: false
    config:
      mode: client_and_server
release: []
```

## Release

Generators in the `release` list will publish to a public registry (e.g. npm, Maven, PyPi). Use this when your API is ready for release. You will need to add additional configuration within each generator to tell Fern where to publish.

For example:

```diff
draft: []
release:
  - name: fernapi/java
    version: 0.0.xxx
+   mode: client
+   outputs:
+     maven:
+       url: https://s01.oss.sonatype.org/content/repositories/releases/
+       coordinate: <maven-group:maven-artifact>
+       username: ${MAVEN_USERNAME} # .env variable
+       password: ${MAVEN_PASSWORD}
```

## Supported generators

### Generate SDKs

- **fern-typescript**: a JavaScript SDK, fully typed with TypeScript declarations. Build Node.js, web, and mobile web applications.
- **fern-java**: A Java SDK.
- **fern-python**: A Python SDK. _(coming soon!)_

### Generate server interfaces

- **fern-typescript**: validation that your JavaScript or TypeScript Express server correctly implements your API.
- **java-spring-server**: validation that your Java Spring server correctly implements your API.
- **python-fastapi-server**: validation that your Python FastAPI server correctly implements your API. _(coming soon!)_

### Generate a Postman Collection

**postman**: generates a [Postman Collection](https://www.postman.com/collection). If you'd like to use the Postman integration to auto-update your collection, [read on](../features/postman.md).

### Generate an OpenAPI Specification

**openapi**: generates an [OpenAPI Spec](https://swagger.io/resources/open-api/).

## Contributing

Fern gives a lot of importance to being a community project, and we rely on your help as much as you rely on ours. If you'd like to write a code generator, [reach out](mailto:hey@buildwithfern.com?subject=I'm%20interested%20in%20writing%20a%20code%20generator).
