---
name: nullable-request-body-custom-commands
description: How to author custom commands for the nullable-request-body CLI using the co-generated SDK.
---

# Custom Commands for `nullable-request-body`

## Overview

The `nullable-request-body` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/nullable-request-body/custom.rs    ← Your command handlers (protected by .fernignore)
cli/nullable-request-body/sdk_glue.rs  ← Generated bridge: sdk_client() + block_on()
cli/nullable-request-body/main.rs      ← Generated entrypoint (calls custom::register)
nullable-request-body-sdk/             ← Co-generated typed SDK crate
nullable-request-body-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/nullable-request-body/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use nullable_request_body_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("test-method-name")
            .about("Post Nullable Request Body")
            .arg(clap::Arg::new("path_param").required(true))
        ,
        |matches, ctx| {
            let path_param = matches.get_one::<String>("path_param").unwrap();
            let client = super::sdk_glue::sdk_client(ctx);
            let result = super::sdk_glue::block_on(
                client.test_group.test_method_name(path_param),
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
nullable-request-body test-method-name <path_param>
```

### 2. Available SDK Clients

The `sdk_glue::sdk_client(ctx)` call returns a `nullable_request_body_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.test_group` | `nullable_request_body_sdk::api::TestGroupClient` | test_group operations |

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
use nullable_request_body_sdk::api::*;
```

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/nullable-request-body/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/nullable-request-body/sdk_glue.rs` | Yes | Bridges AppContext → SDK client |
| `cli/nullable-request-body/main.rs` | Yes | Calls `custom::register(app)` |
| `nullable-request-body-sdk/` | Yes | Co-generated typed SDK crate |
| `nullable-request-body-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
nullable-request-body <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug nullable-request-body <your-command> [args]
```
