---
name: no-content-response-custom-commands
description: How to author custom commands for the no-content-response CLI using the co-generated SDK.
---

# Custom Commands for `no-content-response`

## Overview

The `no-content-response` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/no-content-response/custom.rs    ← Your command handlers (protected by .fernignore)
cli/no-content-response/sdk_glue.rs  ← Generated bridge: sdk_client() + block_on()
cli/no-content-response/main.rs      ← Generated entrypoint (calls custom::register)
no-content-response-sdk/             ← Co-generated typed SDK crate
no-content-response-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/no-content-response/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use no_content_response_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("get")
            .about("Get Contact")
            .arg(clap::Arg::new("id").required(true))
        ,
        |matches, ctx| {
            let id = matches.get_one::<String>("id").unwrap();
            let client = super::sdk_glue::sdk_client(ctx);
            let result = super::sdk_glue::block_on(
                client.contacts.get(id),
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
no-content-response get <id>
```

### 2. Available SDK Clients

The `sdk_glue::sdk_client(ctx)` call returns a `no_content_response_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.contacts` | `no_content_response_sdk::api::ContactsClient` | contacts operations |

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
use no_content_response_sdk::api::*;
```

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/no-content-response/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/no-content-response/sdk_glue.rs` | Yes | Bridges AppContext → SDK client |
| `cli/no-content-response/main.rs` | Yes | Calls `custom::register(app)` |
| `no-content-response-sdk/` | Yes | Co-generated typed SDK crate |
| `no-content-response-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
no-content-response <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug no-content-response <your-command> [args]
```
