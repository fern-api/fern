<!-- markdownlint-disable MD033 -->

# CLI

Fern provides a set of command-line commands to help you generate clients, servers, documentation, and more. To install the Fern CLI run:

```bash
npm install -g fern-api
```

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

- [`api.yml`](definition.md#an-example-of-a-fern-api-definition) is an example Fern API Definition for IMDb.
- [`.fernrc.yml`](fernrc.md) is a configuration file local to a single API in your repo.
- [`fern.config.json`](fern-config-json.md) is a configuration file that applies to all APIs in your repo.

### `fern add <generator>`

Adds a generator to `.fernrc.yml`. Check out a [list of generators](docs/generators.md) you can use.

### `fern generate`

Takes the Fern API Definition location described in `.fernrc.yml` and runs the listed generators.

### `fern compile`

Compiles your Fern API Definition.
