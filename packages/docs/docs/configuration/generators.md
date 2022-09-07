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

Generators in the `draft` list will publish to a private registry managed by Fern. Use this when your API is a work-in-progress. By default, code generators you add will show up as a draft.

[Add a generator](../cli/add.md) in the CLI. For example, when we add the `javascript-sdk` generator:

```diff
# generators.yml
draft:
+ - name: fernapi/javascript-sdk
+   version: 0.0.xxx
release: []
```

## Release

Generators in the `release` list will publish to a public registry (e.g. npm, Maven, PyPi). Use this when your API is ready for release. You will need to add additional configuration within each generator to tell Fern where to publish.

For example:

```diff
draft: []
release:
  - name: fernapi/java-sdk
    version: 0.0.xxx
+   outputs:
+     maven:
+       url: https://s01.oss.sonatype.org/content/repositories/releases/
+       coordinate: <maven-group:maven-artifact>
+       username: ${MAVEN_USERNAME} # .env variable
+       password: ${MAVEN_PASSWORD}
```

## Supported generators

### Generate SDKs

- **javascript-sdk**: a JavaScript SDK, fully typed with TypeScript declarations. Build Node.js, web, and mobile web applications.
- **java-sdk**: A Java SDK.
- **python-sdk**: A Python SDK.

### Generate server interfaces

- **javascript-express-server**: validation that your JavaScript or TypeScript Express server correctly implements your API.
- **java-spring-server**: validation that your Java Spring server correctly implements your API.
- **python-fastapi-server**: validation that your Python FastAPI server correctly implements your API.

### Generate a Postman Collection

**fern-postman**: generates a [Postman Collection](https://www.postman.com/collection). If you'd like to use the Postman integration to auto-update your collection, [read on](../features/postman.md).

### Generate an OpenAPI Specification

**fern-openapi**: generates an [OpenAPI Spec](https://swagger.io/resources/open-api/).

## Contributing

Fern gives a lot of importance to being a community project, and we rely on your help as much as you rely on ours. If you'd like to write a code generator, [reach out](mailto:hey@buildwithfern.com?subject=I'm%20interested%20in%20writing%20a%20code%20generator).
