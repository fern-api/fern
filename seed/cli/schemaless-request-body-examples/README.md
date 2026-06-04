# Schemaless Request Body Examples API CLI

Command-line interface for the Schemaless Request Body Examples API.

## Installation

Install the [Rust toolchain](https://rustup.rs/) if you don't have it:

```bash
curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Then build from source:

```bash
cargo build --release
./target/release/schemaless-request-body-examples-api --help
```

## Authentication

This API requires authentication. Run `schemaless-request-body-examples-api --help` for details.

## Usage

```
Schemaless Request Body Examples API

Usage: schemaless-request-body-examples-api [OPTIONS] <COMMAND>

Commands:
  ...                API resource commands (run --help to list)
  generate-skills    Generate SKILL.md files for AI agent integration
  completion         Generate shell completion scripts
  man                Generate a man page (roff format)
  help               Print this message or the help of the given subcommand(s)

Options:
      --dry-run          Validate the request locally without sending it to the API
      --format <FORMAT>  Output format: json (default), table, yaml, csv
      --base-url <URL>   Override the API base URL (e.g. for testing against a mock server)
  -q, --quiet            Suppress stdout output on success (errors still go to stderr)
  -h, --help             Print help
  -V, --version          Print version

Environment variables:
  SCHEMALESS_REQUEST_BODY_EXAMPLES_API_BASE_URLOverride the API base URL
  SCHEMALESS_REQUEST_BODY_EXAMPLES_API_CA_BUNDLEPath to PEM file with extra trust roots (or SSL_CERT_FILE)
  SCHEMALESS_REQUEST_BODY_EXAMPLES_API_INSECURE=1Skip TLS verification (debugging only)
  SCHEMALESS_REQUEST_BODY_EXAMPLES_API_PROXYHTTP(S) proxy URL
  SCHEMALESS_REQUEST_BODY_EXAMPLES_API_TIMEOUT_SECSTotal request timeout

Standard env vars (HTTPS_PROXY / HTTP_PROXY / NO_PROXY / SSL_CERT_FILE) are also honored.
```

Every API resource appears as a subcommand (e.g. `schemaless-request-body-examples-api <resource> <method>`). Run `schemaless-request-body-examples-api <resource> --help` to see available methods.

## Common flags

These flags are available on every operation:

| Flag | Description |
|------|-------------|
| `--dry-run` | Validate the request locally and print the HTTP request without sending it — useful for scripting and agent workflows |
| `--json <JSON\|->` | Supply a request body as JSON (or `-` to read stdin); individual body fields also have their own flags |
| `--params <JSON>` | Merge extra parameters as JSON (overrides individual flags) |
| `--format <json\|table\|yaml\|csv>` | Output format (default `json`) |
| `--output <PATH>` | Write binary responses to a file |
| `--base-url <URL>` | Override the API base URL (e.g. for testing against a mock server) |
| `--page-all` | Auto-paginate and stream results as NDJSON |
| `--page-limit <N>` | Max pages to fetch when auto-paginating (default `10`) |
| `-q, --quiet` | Suppress stdout output on success (errors still go to stderr) |

### Dry run

The `--dry-run` flag renders the exact HTTP request the CLI would send, without executing it. This is particularly valuable for AI agent integration — agents can validate their intent before committing to a write operation:

```bash
schemaless-request-body-examples-api <resource> <method> --dry-run
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `SCHEMALESS_REQUEST_BODY_EXAMPLES_API_BASE_URL` | Override the API base URL |
| `SCHEMALESS_REQUEST_BODY_EXAMPLES_API_CA_BUNDLE` | Path to PEM file with extra trust roots (or `SSL_CERT_FILE`) |
| `SCHEMALESS_REQUEST_BODY_EXAMPLES_API_INSECURE=1` | Skip TLS verification (debugging only) |
| `SCHEMALESS_REQUEST_BODY_EXAMPLES_API_PROXY` | HTTP(S) proxy URL |
| `SCHEMALESS_REQUEST_BODY_EXAMPLES_API_TIMEOUT_SECS` | Total request timeout in seconds |

Standard environment variables (`HTTPS_PROXY` / `HTTP_PROXY` / `NO_PROXY` / `SSL_CERT_FILE`) are also honored.

## Output formats

Use the global `--format` flag to control output. Supported values: `json` (default), `table`, `yaml`, `csv`.

```bash
# Pipe JSON output through jq
schemaless-request-body-examples-api <resource> <method> --format json | jq

# Machine-readable catalog of every operation
schemaless-request-body-examples-api --help --format json | jq 'length'
```

## Shell completion

Generate shell completion scripts:

```bash
schemaless-request-body-examples-api completion <bash|zsh|fish|powershell>
```

