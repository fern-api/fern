# Nullable AllOf Extends Test CLI

Command-line interface for the Nullable AllOf Extends Test API.

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
./target/release/nullable-allof-extends-test --help
```

## Authentication

This API requires authentication. Run `nullable-allof-extends-test --help` for details.

## Quick start

List available commands:

```bash
nullable-allof-extends-test --help
```

Call an API endpoint:

```bash
nullable-allof-extends-test <resource> <method>
```

Run `nullable-allof-extends-test <resource> --help` to see available methods for a resource.

## Usage

Every API resource appears as a subcommand (e.g. `nullable-allof-extends-test <resource> <method>`). Run `nullable-allof-extends-test <resource> --help` to see available methods.

Provide request parameters as flags or as JSON:

```bash
nullable-allof-extends-test <resource> <method> --json '{"key": "value"}'
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
| `NULLABLE_ALLOF_EXTENDS_TEST_BASE_URL` | Override the API base URL |
| `NULLABLE_ALLOF_EXTENDS_TEST_CA_BUNDLE` | Path to PEM file with extra trust roots (or `SSL_CERT_FILE`) |
| `NULLABLE_ALLOF_EXTENDS_TEST_INSECURE=1` | Skip TLS verification (debugging only) |
| `NULLABLE_ALLOF_EXTENDS_TEST_PROXY` | HTTP(S) proxy URL |
| `NULLABLE_ALLOF_EXTENDS_TEST_TIMEOUT_SECS` | Total request timeout in seconds |

Standard environment variables (`HTTPS_PROXY` / `HTTP_PROXY` / `NO_PROXY` / `SSL_CERT_FILE`) are also honored.

### Output formats

Use the global `--format` flag to control output. Supported values: `json` (default), `table`, `yaml`, `csv`.

```bash
# Pipe JSON output through jq
nullable-allof-extends-test <resource> <method> --format json | jq

# Machine-readable catalog of every operation
nullable-allof-extends-test --help --format json | jq 'length'
```

### Shell completion

Generate shell completion scripts:

```bash
nullable-allof-extends-test completion <bash|zsh|fish|powershell>
```

