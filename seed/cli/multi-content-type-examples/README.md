# Multi Content Type Examples CLI

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-CLI%20generated%20by%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Multi%20Content%20Type%20Examples%2FCLI)

Command-line interface for the Multi Content Type Examples API.

## Table of contents

- [Installation](#installation)
- [Authentication](#authentication)
- [Quick start](#quick-start)
- [Usage](#usage)
- [Documentation](#documentation)
- [Advanced](#advanced)
  - [Common flags](#common-flags)
  - [Environment variables](#environment-variables)
  - [Output formats](#output-formats)
  - [Shell completion](#shell-completion)

## Installation

### Shell (macOS / Linux)

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/<org>/<repo>/releases/latest/download/fern-cli-sdk-installer.sh | sh
```

### PowerShell (Windows)

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://github.com/<org>/<repo>/releases/latest/download/fern-cli-sdk-installer.ps1 | iex"
```

### Build from source

If you prefer to build from source, install the [Rust toolchain](https://rustup.rs/) and run:

```bash
cargo build --release
./target/release/multi-content-type-examples --help
```

## Authentication

This API requires authentication. Run `multi-content-type-examples --help` for details.

## Quick start

List available commands:

```bash
multi-content-type-examples --help
```

Call an API endpoint:

```bash
multi-content-type-examples <resource> <method>
```

Run `multi-content-type-examples <resource> --help` to see available methods for a resource.

## Usage

Every API resource appears as a subcommand (e.g. `multi-content-type-examples <resource> <method>`). Run `multi-content-type-examples <resource> --help` to see available methods.

Provide request parameters as flags or as JSON:

```bash
multi-content-type-examples <resource> <method> --json '{"key": "value"}'
```

## Documentation

See [reference.md](./reference.md) for the full command reference.

## Advanced

### Common flags

These flags are available on every operation:

| Flag | Description |
|------|-------------|
| `--dry-run` | Validate the request locally and print the HTTP request without sending it |
| `--json <JSON\|->` | Supply a request body as JSON (or `-` to read stdin) |
| `--params <JSON>` | Merge extra parameters as JSON (overrides individual flags) |
| `--format <json\|table\|yaml\|csv>` | Output format (default `json`) |
| `--output <PATH>` | Write binary responses to a file |
| `--base-url <URL>` | Override the API base URL |
| `--page-all` | Auto-paginate and stream results as NDJSON |
| `--page-limit <N>` | Max pages to fetch when auto-paginating (default `10`) |
| `-q, --quiet` | Suppress stdout output on success (errors still go to stderr) |

### Environment variables

| Variable | Description |
|----------|-------------|
| `MULTI_CONTENT_TYPE_EXAMPLES_BASE_URL` | Override the API base URL |
| `MULTI_CONTENT_TYPE_EXAMPLES_CA_BUNDLE` | Path to PEM file with extra trust roots (or `SSL_CERT_FILE`) |
| `MULTI_CONTENT_TYPE_EXAMPLES_INSECURE=1` | Skip TLS verification (debugging only) |
| `MULTI_CONTENT_TYPE_EXAMPLES_PROXY` | HTTP(S) proxy URL |
| `MULTI_CONTENT_TYPE_EXAMPLES_TIMEOUT_SECS` | Total request timeout in seconds |

Standard environment variables (`HTTPS_PROXY` / `HTTP_PROXY` / `NO_PROXY` / `SSL_CERT_FILE`) are also honored.

### Output formats

Use the global `--format` flag to control output. Supported values: `json` (default), `table`, `yaml`, `csv`.

```bash
# Pipe JSON output through jq
multi-content-type-examples <resource> <method> --format json | jq

# Machine-readable catalog of every operation
multi-content-type-examples --help --format json | jq 'length'
```

### Shell completion

Generate shell completion scripts:

```bash
multi-content-type-examples completion <bash|zsh|fish|powershell>
```

