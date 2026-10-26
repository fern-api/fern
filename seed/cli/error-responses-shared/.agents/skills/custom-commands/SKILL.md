---
name: messages-custom-commands
description: How to author custom commands for the messages CLI using the co-generated SDK.
---

# Custom Commands for `messages`

## Overview

The `messages` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/messages/custom.rs    ← Your command handlers (protected by .fernignore)
cli/messages/sdk.rs       ← Generated bridge: client() + block_on()
cli/messages/main.rs      ← Generated entrypoint (calls custom::register)
messages-sdk/             ← Co-generated typed SDK crate
messages-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/messages/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use messages_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("list-messages")
            .about("Run messages list-messages")
        ,
        |matches, ctx| {
            let client = super::sdk::client(ctx);
            let result = super::sdk::block_on(
                client.messages.list_messages(),
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
messages list-messages
```

### 2. Available SDK Clients

The `super::sdk::client(ctx)` call returns a `messages_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.calls` | `messages_sdk::api::CallsClient` | calls operations |
| `client.calls` | `messages_sdk::api::CallsClient2` | calls operations |
| `client.messages` | `messages_sdk::api::MessagesClient` | messages operations |
| `client.messages` | `messages_sdk::api::MessagesClient2` | messages operations |

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
use messages_sdk::api::*;
```

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/messages/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/messages/sdk.rs` | Yes | Bridges AppContext → SDK client |
| `cli/messages/main.rs` | Yes | Calls `custom::register(app)` |
| `messages-sdk/` | Yes | Co-generated typed SDK crate |
| `messages-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
messages <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug messages <your-command> [args]
```
