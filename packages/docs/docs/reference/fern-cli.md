---
sidebar_position: 9
title: Fern CLI
---

<!-- markdownlint-disable MD033 -->

# CLI

Fern provides a set of command-line commands to help you generate clients, servers, documentation, and more. To install the Fern CLI run:

```bash
npm install -g fern-api
```

---

## Commands

### `fern init`

Initializes Fern which adds the following content:

```yml
api/
├── src
│   ├── api.yml
└── .fernrc.yml
fern.config.json
```

- [`api.yml`](../concepts/api/definition.md) is an example Fern API Definition for IMDb.
- [`.fernrc.yml`](fernrc) is a configuration file local to a single API in your repo.
- [`fern.config.json`](fern-config-json) is a configuration file that applies to all APIs in your repo.

---

### `fern add <generator>`

Adds a generator to `.fernrc.yml`. Check out a [list of generators](../concepts/generators.md) you can use. As an example, let's look how we add the TypeScript and Postman generators.

#### fern add typescript

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
```

#### fern add postman

```diff
 name: api
 definition: src
-generators: []
+generators:
+  - name: fernapi/fern-postman
+    version: 0.0.6
+    generate:
+      enabled: true
+      output: ./generated-postman.json
```

---

### `fern generate`

Takes the API Definition location described in `.fernrc.yml` and runs the listed generators remotely.

---

### `fern check`

Runs validation rules to your Fern API Definition locally.

---
