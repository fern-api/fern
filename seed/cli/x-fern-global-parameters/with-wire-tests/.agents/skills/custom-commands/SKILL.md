---
name: test-x-fern-global-parameters-extension-custom-commands
description: How to author custom commands for the test-x-fern-global-parameters-extension CLI using the co-generated SDK.
---

# Custom Commands for `test-x-fern-global-parameters-extension`

## Overview

The `test-x-fern-global-parameters-extension` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/test-x-fern-global-parameters-extension/custom.rs    ← Your command handlers (protected by .fernignore)
cli/test-x-fern-global-parameters-extension/sdk.rs       ← Generated bridge: client() + block_on()
cli/test-x-fern-global-parameters-extension/main.rs      ← Generated entrypoint (calls custom::register)
test-x-fern-global-parameters-extension-sdk/             ← Co-generated typed SDK crate
test-x-fern-global-parameters-extension-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/test-x-fern-global-parameters-extension/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use test_x_fern_global_parameters_extension_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("get")
            .about("Run products get")
            .arg(clap::Arg::new("regionId").required(true))
            .arg(clap::Arg::new("productId").required(true))
        ,
        |matches, ctx| {
            let region_id = matches.get_one::<String>("regionId").unwrap();
            let product_id = matches.get_one::<String>("productId").unwrap();
            let client = super::sdk::client(ctx);
            let result = super::sdk::block_on(
                client.products.get(region_id, product_id),
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
test-x-fern-global-parameters-extension get <regionId> <productId>
```

### 2. Available SDK Clients

The `super::sdk::client(ctx)` call returns a `test_x_fern_global_parameters_extension_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.products` | `test_x_fern_global_parameters_extension_sdk::api::ProductsClient` | products operations |

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
use test_x_fern_global_parameters_extension_sdk::api::*;
```

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/test-x-fern-global-parameters-extension/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/test-x-fern-global-parameters-extension/sdk.rs` | Yes | Bridges AppContext → SDK client |
| `cli/test-x-fern-global-parameters-extension/main.rs` | Yes | Calls `custom::register(app)` |
| `test-x-fern-global-parameters-extension-sdk/` | Yes | Co-generated typed SDK crate |
| `test-x-fern-global-parameters-extension-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
test-x-fern-global-parameters-extension <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug test-x-fern-global-parameters-extension <your-command> [args]
```
