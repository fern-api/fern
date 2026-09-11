---
name: acme-custom-commands
description: How to author custom commands for the acme CLI using the co-generated SDK.
---

# Custom Commands for `acme`

## Overview

The `acme` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/acme/custom.rs    ← Your command handlers (protected by .fernignore)
cli/acme/sdk.rs       ← Generated bridge: client() + block_on()
cli/acme/main.rs      ← Generated entrypoint (calls custom::register)
acme-sdk/             ← Co-generated typed SDK crate
acme-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/acme/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use acme_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("my-command")
            .about("Description of your command")
            .arg(clap::Arg::new("id").required(true)),
        |matches, ctx| {
            let id = matches.get_one::<String>("id").unwrap();
            let client = super::sdk::client(ctx);
            let result = super::sdk::block_on(
                client.knowledge.get(id),
            )?;
            println!("{}", serde_json::to_string_pretty(&result).unwrap());
            Ok(())
        },
    );
    app
}
```

### 2. Available SDK Clients

The `super::sdk::client(ctx)` call returns a `acme_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.knowledge` | `acme_sdk::api::KnowledgeClient` | knowledge operations |
| `client.messages` | `acme_sdk::api::MessagesClient` | messages operations |
| `client.messages` | `acme_sdk::api::MessagesClient2` | messages operations |

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
use acme_sdk::api::*;
```

### 4. Authentication

Custom commands automatically inherit the CLI's authentication.
The following auth schemes are configured:

- **bearerAuth** (bearer): env `ACME_TOKEN`

No manual auth wiring is needed in custom command handlers.

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/acme/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/acme/sdk.rs` | Yes | Bridges AppContext → SDK client |
| `cli/acme/main.rs` | Yes | Calls `custom::register(app)` |
| `acme-sdk/` | Yes | Co-generated typed SDK crate |
| `acme-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
acme <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug acme <your-command> [args]
```
