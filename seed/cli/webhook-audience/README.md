# Webhook Audience Test CLI

Command-line interface for the Webhook Audience Test API.

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
./target/release/webhook-audience-test --help
```

## Authentication

This API requires authentication. Run `webhook-audience-test --help` for details.

## Quick start

List available commands:

```bash
webhook-audience-test --help
```

Call an API endpoint:

```bash
webhook-audience-test <resource> <method>
```

Run `webhook-audience-test <resource> --help` to see available methods for a resource.

## Usage

Every API resource appears as a subcommand (e.g. `webhook-audience-test <resource> <method>`). Run `webhook-audience-test <resource> --help` to see available methods.

Provide request parameters as flags or as JSON:

```bash
webhook-audience-test <resource> <method> --json '{"key": "value"}'
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
| `WEBHOOK_AUDIENCE_TEST_BASE_URL` | Override the API base URL |
| `WEBHOOK_AUDIENCE_TEST_CA_BUNDLE` | Path to PEM file with extra trust roots (or `SSL_CERT_FILE`) |
| `WEBHOOK_AUDIENCE_TEST_INSECURE=1` | Skip TLS verification (debugging only) |
| `WEBHOOK_AUDIENCE_TEST_PROXY` | HTTP(S) proxy URL |
| `WEBHOOK_AUDIENCE_TEST_TIMEOUT_SECS` | Total request timeout in seconds |

Standard environment variables (`HTTPS_PROXY` / `HTTP_PROXY` / `NO_PROXY` / `SSL_CERT_FILE`) are also honored.

### Output formats

Use the global `--format` flag to control output. Supported values: `json` (default), `table`, `yaml`, `csv`.

```bash
# Pipe JSON output through jq
webhook-audience-test <resource> <method> --format json | jq

# Machine-readable catalog of every operation
webhook-audience-test --help --format json | jq 'length'
```

### Shell completion

Generate shell completion scripts:

```bash
webhook-audience-test completion <bash|zsh|fish|powershell>
```

