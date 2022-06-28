# Getting started

This guide introduces you to the `fern cli`.

## Prerequisites

- Install [`npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

## Install Fern

```bash
npm install -g fern-api
```

## Initial setup

In the root of your backend repo, run:

```bash
fern init
```

This will add an `api` directory with the following content:

```yml
api/
├── src
│   ├── api.yaml
└── .fernrc.yml
```

`.fernrc.yml` is \_\_. It contains three fields:

- **name**: the name of your API
- **definition**: the path to your [Fern API Definition]()
- **generators**: a list of [supported generators]() that convert your definition to TODO

## Fern API Definition

By default `fern init` sets you up with an `api.yml` that has an example `imdb-api`. (We like movies!)

This defines your API including services, endpoints, types, and errors. Read more about how to configure your definition [here]().`

## Add generators

Let's codegen! For this walkthrough, we'll generate a TypeScript server and a Postman Collection.

```bash
fern add typescript
fern add postman
```

`.fernrc.yml` will now list two generators:

```diff
 name: api
 definition: src
-generators: []
+generators:
+  - name: fernapi/fern-typescript
+    version: 0.0.101
+    generate: true
+    config:
+      mode: server
+  - name: fernapi/fern-postman
+    version: 0.0.6
+    generate:
+      enabled: true
+      output: ./generated-postman.json
```

A generator contains thr `name`, `version`, a location where it will `output` generated files, and a `config`. We'll keep the defaults provided.

Now let's add the Typescript generator by running:

```bash
fern add typescript
```

Our `.fernrc.yml` now looks like:

```yml
name: imdb-api
definition: src
generators:
  - name: fernapi/fern-java
    version: 0.0.32
    output: generated-java
    config:
      packagePrefix: com
      mode: client_and_server
  - name: fernapi/fern-typescript
    version: 0.0.71
    output: generated-typescript
    config:
      mode: client_and_server
```

## Generate servers and clients

Now that we've got Java and TypeScript generators, let's codegen our `imdb-api` example into both languages.

```bash
fern generate
```

We'll see two new directories created `generated-java` and `generated-typescript`. We can look inside to find our server stubs, model, and clients generated.
