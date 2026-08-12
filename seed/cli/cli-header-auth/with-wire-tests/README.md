# Header Auth CLI CLI

Command-line interface for the Header Auth CLI API.

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
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/<org>/<repo>/releases/latest/download/header-auth-cli-installer.sh | sh
```

### PowerShell (Windows)

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://github.com/<org>/<repo>/releases/latest/download/header-auth-cli-installer.ps1 | iex"
```

### Build from source

If you prefer to build from source, install the [Rust toolchain](https://rustup.rs/) and run:

```bash
cargo build --release
./target/release/header-auth-cli --help
```

## Authentication

Set the following environment variable(s) before using the CLI:

```bash
export HEADER_AUTH_CLI_API_KEY="<your api key>"
```

A `.env` file in the working directory is also supported — the CLI auto-loads it on startup.

## Quick start

List available commands:

```bash
header-auth-cli --help
```

Call an API endpoint:

```bash
header-auth-cli <resource> <method>
```

Run `header-auth-cli <resource> --help` to see available methods for a resource.

## Usage

Every API resource appears as a subcommand (e.g. `header-auth-cli <resource> <method>`). Run `header-auth-cli <resource> --help` to see available methods.

Provide request parameters as flags or as JSON:

```bash
header-auth-cli <resource> <method> --json '{"key": "value"}'
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
| `HEADER_AUTH_CLI_BASE_URL` | Override the API base URL |
| `HEADER_AUTH_CLI_CA_BUNDLE` | Path to PEM file with extra trust roots (or `SSL_CERT_FILE`) |
| `HEADER_AUTH_CLI_INSECURE=1` | Skip TLS verification (debugging only) |
| `HEADER_AUTH_CLI_PROXY` | HTTP(S) proxy URL |
| `HEADER_AUTH_CLI_TIMEOUT_SECS` | Total request timeout in seconds |

Standard environment variables (`HTTPS_PROXY` / `HTTP_PROXY` / `NO_PROXY` / `SSL_CERT_FILE`) are also honored.

### Output formats

Use the global `--format` flag to control output. Supported values: `json` (default), `table`, `yaml`, `csv`.

```bash
# Pipe JSON output through jq
header-auth-cli <resource> <method> --format json | jq

# Machine-readable catalog of every operation
header-auth-cli --help --format json | jq 'length'
```

### Shell completion

Generate shell completion scripts:

```bash
header-auth-cli completion <bash|zsh|fish|powershell>
```

