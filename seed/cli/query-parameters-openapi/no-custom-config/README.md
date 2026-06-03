# Query Parameters API CLI

Command-line interface for the Query Parameters API API.

## Installation

Build from source:

```bash
cargo build --release
```

The compiled binary will be available at `target/release/query-parameters-api`.

## Authentication

This API requires authentication. Run `query-parameters-api --help` for details.

## Usage

```bash
query-parameters-api --help                 # list commands and flags
query-parameters-api --help --format json   # full machine-readable command surface
```

## Output formats

Use the global `--format` flag to control output. Supported values: `json` (default), `table`, `yaml`, `csv`.

```bash
query-parameters-api <command> --format json | jq
```

## Configuration

Override the default base URL with the `--base-url` flag or the environment variable:

```bash
export QUERY_PARAMETERS_API_BASE_URL="https://api.example.com"
```

## Shell completion

Generate shell completion scripts:

```bash
query-parameters-api completion <bash|zsh|fish|powershell>
```

