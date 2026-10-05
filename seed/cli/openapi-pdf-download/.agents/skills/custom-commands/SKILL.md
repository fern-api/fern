---
name: openapi-pdf-download-custom-commands
description: How to author custom commands for the openapi-pdf-download CLI using the co-generated SDK.
---

# Custom Commands for `openapi-pdf-download`

## Overview

The `openapi-pdf-download` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/openapi-pdf-download/custom.rs    ← Your command handlers (protected by .fernignore)
cli/openapi-pdf-download/sdk.rs       ← Generated bridge: client() + block_on()
cli/openapi-pdf-download/main.rs      ← Generated entrypoint (calls custom::register)
openapi-pdf-download-sdk/             ← Co-generated typed SDK crate
openapi-pdf-download-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/openapi-pdf-download/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use openapi_pdf_download_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("get-pdf")
            .about("Run asset-report get-pdf")
        ,
        |matches, ctx| {
            let client = super::sdk::client(ctx);
            let result = super::sdk::block_on(
                client.asset_report.get_pdf(),
            )?;
            println!("{}", serde_json::to_string_pretty(&result).unwrap());
            Ok(())
        },
    );
    app
}
```

Then build and test:
```bash
cargo build
openapi-pdf-download get-pdf
```

### 2. Available SDK Clients

The `super::sdk::client(ctx)` call returns a `openapi_pdf_download_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.asset_report` | `openapi_pdf_download_sdk::api::AssetReportClient` | asset_report operations |

### 3. Key Patterns

**Get the SDK client** (execution-sharing, fully authenticated):
```rust
let client = super::sdk::client(ctx);
```

**Run an async SDK call from a sync handler:**
```rust
let result = super::sdk::block_on(
    client.some_resource.some_method(args),
)?;
```

**Use typed models for request/response serialization:**
```rust
use openapi_pdf_download_sdk::api::*;
```

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/openapi-pdf-download/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/openapi-pdf-download/sdk.rs` | Yes | Bridges AppContext → SDK client |
| `cli/openapi-pdf-download/main.rs` | Yes | Calls `custom::register(app)` |
| `openapi-pdf-download-sdk/` | Yes | Co-generated typed SDK crate |
| `openapi-pdf-download-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
openapi-pdf-download <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug openapi-pdf-download <your-command> [args]
```
