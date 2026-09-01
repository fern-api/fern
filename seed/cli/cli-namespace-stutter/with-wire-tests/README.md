# Versioned Store CLI

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-CLI%20generated%20by%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Versioned%20Store%2FCLI)

Command-line interface for the Versioned Store API.

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
- [Attribution](#attribution)

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
./target/release/versioned-store --help
```

## Authentication

This API requires authentication. Run `versioned-store --help` for details.

## Quick start

List available commands:

```bash
versioned-store --help
```

Call an API endpoint:

```bash
versioned-store <resource> <method>
```

Run `versioned-store <resource> --help` to see available methods for a resource.

## Usage

Every API resource appears as a subcommand (e.g. `versioned-store <resource> <method>`). Run `versioned-store <resource> --help` to see available methods.

Provide request parameters as flags or as JSON:

```bash
versioned-store <resource> <method> --json '{"key": "value"}'
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
| `VERSIONED_STORE_BASE_URL` | Override the API base URL |
| `VERSIONED_STORE_CA_BUNDLE` | Path to PEM file with extra trust roots (or `SSL_CERT_FILE`) |
| `VERSIONED_STORE_INSECURE=1` | Skip TLS verification (debugging only) |
| `VERSIONED_STORE_PROXY` | HTTP(S) proxy URL |
| `VERSIONED_STORE_TIMEOUT_SECS` | Total request timeout in seconds |

Standard environment variables (`HTTPS_PROXY` / `HTTP_PROXY` / `NO_PROXY` / `SSL_CERT_FILE`) are also honored.

### Output formats

Use the global `--format` flag to control output. Supported values: `json`, `table`, `yaml`, `csv`, `jsonl`, `raw`, `http`.

Without `--format`, output (including errors) is `table` when stdout is a terminal and `json` when it is piped or redirected — so scripts and agents get JSON by default. Pass `--human` to keep the interactive rendering when piping to a pager, and `--format json` to pin JSON in a terminal.

```bash
# Pipe JSON output through jq
versioned-store <resource> <method> --format json | jq

# Keep the human rendering even when piped
versioned-store <resource> <method> --human | less

# Machine-readable catalog of every operation (same as --schema)
versioned-store --help --format json | jq '.operations | length'
```

### Shell completion

Generate shell completion scripts:

```bash
versioned-store completion <bash|zsh|fish|powershell>
```

## Attribution

Built on [fern-cli-sdk](https://github.com/fern-api/fern), Copyright Fern, licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

