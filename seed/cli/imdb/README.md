# api CLI

Command-line interface for the api API.

## Installation

Build from source:

```bash
cargo build --release
```

The compiled binary will be available at `target/release/api`.

## Authentication

Set the following environment variable(s) before using the CLI:

```bash
export API_TOKEN="<your token>"
```

## Usage

```bash
api --help                 # list commands and flags
api --help --format json   # full machine-readable command surface
```

## Output formats

Use the global `--format` flag to control output. Supported values: `json` (default), `table`, `yaml`, `csv`.

```bash
api <command> --format json | jq
```

## Configuration

Override the default base URL with the `--base-url` flag or the environment variable:

```bash
export API_BASE_URL="https://api.example.com"
```

## Shell completion

Generate shell completion scripts:

```bash
api completion <bash|zsh|fish|powershell>
```

