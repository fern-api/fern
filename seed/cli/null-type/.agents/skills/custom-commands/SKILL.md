---
name: null-type-custom-commands
description: How to author custom commands for the null-type CLI using the co-generated SDK.
---

# Custom Commands for `null-type`

## Overview

The `null-type` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/null-type/custom.rs    ← Your command handlers (protected by .fernignore)
cli/null-type/sdk_glue.rs  ← Generated bridge: sdk_client() + block_on()
cli/null-type/main.rs      ← Generated entrypoint (calls custom::register)
null-type-sdk/             ← Co-generated typed SDK crate
null-type-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/null-type/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use null_type_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("get")
            .about("Get User")
            .arg(clap::Arg::new("id").required(true))
        ,
        |matches, ctx| {
            let id = matches.get_one::<String>("id").unwrap();
            let client = super::sdk_glue::sdk_client(ctx);
            let result = super::sdk_glue::block_on(
                client.users.get(id),
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
null-type get <id>
```

### 2. Available SDK Clients

The `sdk_glue::sdk_client(ctx)` call returns a `null_type_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.conversations` | `null_type_sdk::api::ConversationsClient` | conversations operations |
| `client.users` | `null_type_sdk::api::UsersClient` | users operations |

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
use null_type_sdk::api::*;
```

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/null-type/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/null-type/sdk_glue.rs` | Yes | Bridges AppContext → SDK client |
| `cli/null-type/main.rs` | Yes | Calls `custom::register(app)` |
| `null-type-sdk/` | Yes | Co-generated typed SDK crate |
| `null-type-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
null-type <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug null-type <your-command> [args]
```
