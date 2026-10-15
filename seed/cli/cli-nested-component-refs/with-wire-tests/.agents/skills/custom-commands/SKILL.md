---
name: nested-refs-cli-custom-commands
description: How to author custom commands for the nested-refs-cli CLI using the co-generated SDK.
---

# Custom Commands for `nested-refs-cli`

## Overview

The `nested-refs-cli` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/nested-refs-cli/custom.rs    ← Your command handlers (protected by .fernignore)
cli/nested-refs-cli/sdk.rs       ← Generated bridge: client() + block_on()
cli/nested-refs-cli/main.rs      ← Generated entrypoint (calls custom::register)
nested-refs-cli-sdk/             ← Co-generated typed SDK crate
nested-refs-cli-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/nested-refs-cli/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use nested_refs_cli_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("create")
            .about("Create an order")
        ,
        |matches, ctx| {
            let client = super::sdk::client(ctx);
            let result = super::sdk::block_on(
                client.orders.create(),
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
nested-refs-cli create
```

### 2. Available SDK Clients

The `super::sdk::client(ctx)` call returns a `nested_refs_cli_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.orders` | `nested_refs_cli_sdk::api::OrdersClient` | orders operations |
| `client.shipments` | `nested_refs_cli_sdk::api::ShipmentsClient` | shipments operations |

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
use nested_refs_cli_sdk::api::*;
```

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/nested-refs-cli/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/nested-refs-cli/sdk.rs` | Yes | Bridges AppContext → SDK client |
| `cli/nested-refs-cli/main.rs` | Yes | Calls `custom::register(app)` |
| `nested-refs-cli-sdk/` | Yes | Co-generated typed SDK crate |
| `nested-refs-cli-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
nested-refs-cli <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug nested-refs-cli <your-command> [args]
```
