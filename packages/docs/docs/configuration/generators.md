---
title: generators.yml
---

`generators.yml` is a file where you set configuration for which code generators you will use.

## How code generation works

A code generator reads in your **Fern Definition** and outputs code. The outputted code is either published to a registry or downloaded locally within your project. Code generators run remotely in the cloud.

By default, `generators.yml` starts with two empty lists: `draft` and `release`.

```yml
# in generators.yml
draft: []
release: []
```

## An example of generators.md

View an example using multiple generators [on Github](https://github.com/fern-api/fern-examples/blob/main/fern/api/generators.yml) or here:

````yml
# in generators.yml
draft: # Publishes the generated code to a private registry managed by Fern.
  - name: fernapi/fern-typescript
    version: 0.0.197
    generate: true
    config:
      mode: client-v2
  - name: fernapi/fern-java
    version: 0.0.109
    generate: true
    config:
      mode: server

release: # Publishes the generated code to a public registry (e.g. maven, npm, pypi).
  - name: fernapi/fern-java
    version: 0.0.109
    generate: true
    config:
      mode: client
    outputs:
      maven:
        url: https://s01.oss.sonatype.org/content/repositories/releases/
        coordinate: <maven-group:maven-artifact>
        username: ${MAVEN_USERNAME} # .env variable
        password: ${MAVEN_PASSWORD}


## Draft

Generators in the `draft` list will publish to a private registry managed by Fern. Use this when your API is a work-in-progress. By default, code generators you add will show up as a draft.

[Add a generator](../cli/add.md) in the CLI. For example, when we add the `typescript` generator:

```diff
# in generators.yml
draft:
+ - name: fernapi/fern-typescript
+   version: 0.0.xxx
+   config:
+     mode: client_and_server
release: []
````

## Release

Generators in the `release` list will publish to a public registry (e.g. npm, Maven, PyPi). Use this when your API is ready for release. You will need to add additional configuration within each generator to tell Fern where to publish.

For example:

```diff
# in generators.yml
draft: []
release:
  - name: fernapi/fern-java
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
- **fern-java**: validation that your Java Spring server correctly implements your API.
- **python-fastapi-server**: validation that your Python FastAPI server correctly implements your API. _(coming soon!)_

### Generate a Postman Collection

**postman**: generates a [Postman Collection](https://www.postman.com/collection). If you'd like to use the Postman integration to auto-update your collection, [read on](../features/postman.md).

### Generate an OpenAPI document

**openapi**: generates an [OpenAPI document](https://swagger.io/resources/open-api/).

## Contributing

Fern gives a lot of importance to being a community project, and we rely on your help as much as you rely on ours. If you'd like to write a code generator, [reach out](mailto:hey@buildwithfern.com?subject=I'm%20interested%20in%20writing%20a%20code%20generator).
