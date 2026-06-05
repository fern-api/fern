# Query Parameters API CLI

Command-line interface for the Query Parameters API.

## Installation

Install the CLI globally via npm:

```bash
npm install -g @fern/query-parameters-openapi
```

Or run it directly without installing:

```bash
npx @fern/query-parameters-openapi --help
```

### Build from source

If you prefer to build from source, install the [Rust toolchain](https://rustup.rs/) and run:

```bash
cargo build --release
./target/release/query-parameters-api --help
```

## Authentication

This API requires authentication. Run `query-parameters-api --help` for details.

## Usage

```
Query Parameters API

Usage: query-parameters-api [OPTIONS] <COMMAND>

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
  QUERY_PARAMETERS_API_BASE_URL       Override the API base URL
  QUERY_PARAMETERS_API_CA_BUNDLE      Path to PEM file with extra trust roots (or SSL_CERT_FILE)
  QUERY_PARAMETERS_API_INSECURE=1     Skip TLS verification (debugging only)
  QUERY_PARAMETERS_API_PROXY          HTTP(S) proxy URL
  QUERY_PARAMETERS_API_TIMEOUT_SECS   Total request timeout

Standard env vars (HTTPS_PROXY / HTTP_PROXY / NO_PROXY / SSL_CERT_FILE) are also honored.
```

Every API resource appears as a subcommand (e.g. `query-parameters-api <resource> <method>`). Run `query-parameters-api <resource> --help` to see available methods.

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
query-parameters-api <resource> <method> --dry-run
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `QUERY_PARAMETERS_API_BASE_URL` | Override the API base URL |
| `QUERY_PARAMETERS_API_CA_BUNDLE` | Path to PEM file with extra trust roots (or `SSL_CERT_FILE`) |
| `QUERY_PARAMETERS_API_INSECURE=1` | Skip TLS verification (debugging only) |
| `QUERY_PARAMETERS_API_PROXY` | HTTP(S) proxy URL |
| `QUERY_PARAMETERS_API_TIMEOUT_SECS` | Total request timeout in seconds |

Standard environment variables (`HTTPS_PROXY` / `HTTP_PROXY` / `NO_PROXY` / `SSL_CERT_FILE`) are also honored.

## Output formats

Use the global `--format` flag to control output. Supported values: `json` (default), `table`, `yaml`, `csv`.

```bash
# Pipe JSON output through jq
query-parameters-api <resource> <method> --format json | jq

# Machine-readable catalog of every operation
query-parameters-api --help --format json | jq 'length'
```

## Shell completion

Generate shell completion scripts:

```bash
query-parameters-api completion <bash|zsh|fish|powershell>
```

## Documentation

See [reference.md](./reference.md) for the full command reference.

