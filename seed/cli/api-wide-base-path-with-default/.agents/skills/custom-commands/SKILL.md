---
name: api-wide-base-path-with-default-custom-commands
description: How to author custom commands for the api-wide-base-path-with-default CLI using the co-generated SDK.
---

# Custom Commands for `api-wide-base-path-with-default`

## Overview

The `api-wide-base-path-with-default` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/api-wide-base-path-with-default/custom.rs    ← Your command handlers (protected by .fernignore)
cli/api-wide-base-path-with-default/sdk_glue.rs  ← Generated bridge: sdk_client() + block_on()
cli/api-wide-base-path-with-default/main.rs      ← Generated entrypoint (calls custom::register)
api-wide-base-path-with-default-sdk/             ← Co-generated typed SDK crate
api-wide-base-path-with-default-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/api-wide-base-path-with-default/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use api_wide_base_path_with_default_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("widgets-create")
            .about("Run widgets widgets-create")
            .arg(clap::Arg::new("apiVersion").required(true))
        ,
        |matches, ctx| {
            let api_version = matches.get_one::<String>("apiVersion").unwrap();
            let client = super::sdk_glue::sdk_client(ctx);
            let result = super::sdk_glue::block_on(
                client.widgets.widgets_create(api_version),
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
api-wide-base-path-with-default widgets-create <apiVersion>
```

### 2. Available SDK Clients

The `sdk_glue::sdk_client(ctx)` call returns a `api_wide_base_path_with_default_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.widgets` | `api_wide_base_path_with_default_sdk::api::WidgetsClient` | widgets operations |

### 3. Key Patterns

**Get the SDK client** (execution-sharing, fully authenticated):
```rust
let client = super::sdk_glue::sdk_client(ctx);
```

**Run an async SDK call from a sync handler:**
```rust
let result = super::sdk_glue::block_on(
    client.some_resource.some_method(args),
)?;
```

**Use typed models for request/response serialization:**
```rust
use api_wide_base_path_with_default_sdk::api::*;
```

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/api-wide-base-path-with-default/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/api-wide-base-path-with-default/sdk_glue.rs` | Yes | Bridges AppContext → SDK client |
| `cli/api-wide-base-path-with-default/main.rs` | Yes | Calls `custom::register(app)` |
| `api-wide-base-path-with-default-sdk/` | Yes | Co-generated typed SDK crate |
| `api-wide-base-path-with-default-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
api-wide-base-path-with-default <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug api-wide-base-path-with-default <your-command> [args]
```
