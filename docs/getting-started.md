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

`.fernrc.yml` is where you'll configure Fern. It contains three fields:

- **name**: the name of your API
- **definition**: the path to your Fern API Definition
- **generators**: a list of [supported generators](https://docs.buildwithfern.com/#/generators) that convert your definition to clients libraries (SDKs), servers stubs, and documentation automatically.

## Fern API Definition

By default `fern init` sets you up with an `api.yml` that has an example IMDb API. (We like movies!)

This defines your API including the [data model](https://docs.buildwithfern.com/#/defining-the-data-model), [services](https://docs.buildwithfern.com/#/defining-a-service), and [errors](https://docs.buildwithfern.com/#/defining-errors).

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

## Generate

Now that we've got the TypeScript and Postman generators set up, let's generate.

```bash
fern generate
```

In terminal you'll see a npm package for the TypeScripe server that you can depend on in your `package.json`.

In your file tree, you'll see a `generated-postman.json` that you can import to Postman to use your Collection.

## Build your API

Change `api.yml` to reflect your API and start building!
