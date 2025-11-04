# Auth0 Fern Configuration

This repository contains your Fern Configuration:

- [OpenAPI spec](./fern/apis/v4/openapi/openapi.yml)
- [OpenAPI Overrides](./fern/apis/v4/openapi/overrides.json)
- [SDK generator config](./fern/apis/v4/generators.yml)

## Setup

```sh
npm install -g fern-api
```

## Validating your API Definition

To validate your API, run:

```sh
fern check
```

## Managing SDKs

### Deploying your SDKs

To deploy your SDKs, simply run the `Release Python SDK` GitHub Action with the desired version for the release. Under the hood, this leverages the Fern CLI:

```sh
fern generate --group go-sdk
```

### Developing SDKs

You can also regenerate the SDKs locally by running:

```sh
fern generate --group go-sdk --preview --log-level debug
```

This will generate the SDK and download it to a local folder that can be pip installed.

```sh
code fern/.preview/fern-go-sdk
```
