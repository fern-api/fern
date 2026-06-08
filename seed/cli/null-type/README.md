# null-type CLI

Command-line interface for the null-type API.

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

Install the [Rust toolchain](https://rustup.rs/) if you don't have it:

```bash
curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Then build from source:

```bash
cargo build --release
./target/release/null-type --help
```

## Authentication

This API requires authentication. Run `null-type --help` for details.

## Quick start

List available commands:

```bash
null-type --help
```

Call an API endpoint:

```bash
null-type <resource> <method>
```

Run `null-type <resource> --help` to see available methods for a resource.

## Usage

Every API resource appears as a subcommand (e.g. `null-type <resource> <method>`). Run `null-type <resource> --help` to see available methods.

Provide request parameters as flags or as JSON:

```bash
null-type <resource> <method> --json '{"key": "value"}'
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
| `NULL_TYPE_BASE_URL` | Override the API base URL |
| `NULL_TYPE_CA_BUNDLE` | Path to PEM file with extra trust roots (or `SSL_CERT_FILE`) |
| `NULL_TYPE_INSECURE=1` | Skip TLS verification (debugging only) |
| `NULL_TYPE_PROXY` | HTTP(S) proxy URL |
| `NULL_TYPE_TIMEOUT_SECS` | Total request timeout in seconds |

Standard environment variables (`HTTPS_PROXY` / `HTTP_PROXY` / `NO_PROXY` / `SSL_CERT_FILE`) are also honored.

### Output formats

Use the global `--format` flag to control output. Supported values: `json` (default), `table`, `yaml`, `csv`.

```bash
# Pipe JSON output through jq
null-type <resource> <method> --format json | jq

# Machine-readable catalog of every operation
null-type --help --format json | jq 'length'
```

### Shell completion

Generate shell completion scripts:

```bash
null-type completion <bash|zsh|fish|powershell>
```

