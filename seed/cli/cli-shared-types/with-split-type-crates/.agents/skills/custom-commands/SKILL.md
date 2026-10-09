---
name: shared-types-cli-custom-commands
description: How to author custom commands for the shared-types-cli CLI using the co-generated SDK.
---

# Custom Commands for `shared-types-cli`

## Overview

The `shared-types-cli` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/shared-types-cli/custom.rs    ← Your command handlers (protected by .fernignore)
cli/shared-types-cli/sdk.rs       ← Generated bridge: client() + block_on()
cli/shared-types-cli/main.rs      ← Generated entrypoint (calls custom::register)
shared-types-cli-sdk/             ← Co-generated typed SDK crate
shared-types-cli-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/shared-types-cli/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use shared_types_cli_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("list-items")
            .about("List catalog items")
        ,
        |matches, ctx| {
            let client = super::sdk::client(ctx);
            let result = super::sdk::block_on(
                client.catalog.list_items(),
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
shared-types-cli list-items
```

### 2. Available SDK Clients

The `super::sdk::client(ctx)` call returns a `shared_types_cli_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.catalog` | `shared_types_cli_sdk::api::CatalogClient` | catalog operations |
| `client.billing` | `shared_types_cli_sdk::api::BillingClient` | billing operations |

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
use shared_types_cli_sdk::api::*;
```

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/shared-types-cli/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/shared-types-cli/sdk.rs` | Yes | Bridges AppContext → SDK client |
| `cli/shared-types-cli/main.rs` | Yes | Calls `custom::register(app)` |
| `shared-types-cli-sdk/` | Yes | Co-generated typed SDK crate |
| `shared-types-cli-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
shared-types-cli <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug shared-types-cli <your-command> [args]
```
