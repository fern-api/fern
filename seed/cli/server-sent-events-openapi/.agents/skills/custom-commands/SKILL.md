---
name: server-sent-events-openapi-custom-commands
description: How to author custom commands for the server-sent-events-openapi CLI using the co-generated SDK.
---

# Custom Commands for `server-sent-events-openapi`

## Overview

The `server-sent-events-openapi` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/server-sent-events-openapi/custom.rs    ← Your command handlers (protected by .fernignore)
cli/server-sent-events-openapi/sdk_glue.rs  ← Generated bridge: sdk_client() + block_on()
cli/server-sent-events-openapi/main.rs      ← Generated entrypoint (calls custom::register)
server-sent-events-openapi-sdk/             ← Co-generated typed SDK crate
server-sent-events-openapi-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/server-sent-events-openapi/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use server_sent_events_openapi_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("my-command")
            .about("Description of your command")
            .arg(clap::Arg::new("id").required(true)),
        |matches, ctx| {
            let id = matches.get_one::<String>("id").unwrap();
            let client = super::sdk_glue::sdk_client(ctx);
            let result = super::sdk_glue::block_on(
                client.resource.get(id),
            )?;
            println!("{}", serde_json::to_string_pretty(&result).unwrap());
            Ok(())
        },
    );
    app
}
```

### 2. Available SDK Clients

The `sdk_glue::sdk_client(ctx)` call returns a `server_sent_events_openapi_sdk::api::Client`
with the following sub-clients:

(Sub-clients are derived from the API spec at generation time.)

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
use server_sent_events_openapi_sdk::api::*;
```

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/server-sent-events-openapi/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/server-sent-events-openapi/sdk_glue.rs` | Yes | Bridges AppContext → SDK client |
| `cli/server-sent-events-openapi/main.rs` | Yes | Calls `custom::register(app)` |
| `server-sent-events-openapi-sdk/` | Yes | Co-generated typed SDK crate |
| `server-sent-events-openapi-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
server-sent-events-openapi <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug server-sent-events-openapi <your-command> [args]
```
