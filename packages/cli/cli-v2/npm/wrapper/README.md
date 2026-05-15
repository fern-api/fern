# @fern-api/fern

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

The [Fern](https://buildwithfern.com) CLI: build SDKs and developer docs for your API.

## Install

```sh
npm install -g @fern-api/fern
```

This installs the platform-specific binary for your machine via npm's
`optionalDependencies` mechanism. Supported platforms:

| Package                          | OS      | CPU    |
| -------------------------------- | ------- | ------ |
| `@fern-api/fern-darwin-arm64`    | macOS   | arm64  |
| `@fern-api/fern-darwin-x64`      | macOS   | x86_64 |
| `@fern-api/fern-linux-arm64`     | Linux   | arm64  |
| `@fern-api/fern-linux-x64`       | Linux   | x86_64 |
| `@fern-api/fern-win32-x64`       | Windows | x86_64 |

If you're on Alpine or another musl-based Linux distro, install `gcompat`
first so the glibc binary can run:

```sh
apk add gcompat
```

## Use

```sh
fern --help
fern --version
```

You can also run without installing globally:

```sh
npx @fern-api/fern --help
```

## Direct download (no Node required)

Each release also ships a tarball/zip per platform on the
[GitHub Releases page](https://github.com/fern-api/fern/releases). Each archive
is accompanied by a `.sha256` checksum and a build provenance attestation.

## License

[Apache 2.0](https://github.com/fern-api/fern/blob/main/LICENSE)
