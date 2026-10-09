---
name: versioned-store-custom-commands
description: How to author custom commands for the versioned-store CLI using the co-generated SDK.
---

# Custom Commands for `versioned-store`

## Overview

The `versioned-store` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/versioned-store/custom.rs    ← Your command handlers (protected by .fernignore)
cli/versioned-store/sdk.rs       ← Generated bridge: client() + block_on()
cli/versioned-store/main.rs      ← Generated entrypoint (calls custom::register)
versioned-store-sdk/             ← Co-generated typed SDK crate
versioned-store-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/versioned-store/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use versioned_store_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("list")
            .about("Run v1 list")
        ,
        |matches, ctx| {
            let client = super::sdk::client(ctx);
            let result = super::sdk::block_on(
                client.v1.list(),
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
versioned-store list
```

### 2. Available SDK Clients

The `super::sdk::client(ctx)` call returns a `versioned_store_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.v1` | `versioned_store_sdk::api::V1Client` | v1 operations |
| `client.v1` | `versioned_store_sdk::api::V1Client2` | v1 operations |

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
use versioned_store_sdk::api::*;
```

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/versioned-store/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/versioned-store/sdk.rs` | Yes | Bridges AppContext → SDK client |
| `cli/versioned-store/main.rs` | Yes | Calls `custom::register(app)` |
| `versioned-store-sdk/` | Yes | Co-generated typed SDK crate |
| `versioned-store-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
versioned-store <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug versioned-store <your-command> [args]
```
