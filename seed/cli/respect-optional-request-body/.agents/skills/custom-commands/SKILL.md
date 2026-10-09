---
name: optional-referenced-request-bodies-custom-commands
description: How to author custom commands for the optional-referenced-request-bodies CLI using the co-generated SDK.
---

# Custom Commands for `optional-referenced-request-bodies`

## Overview

The `optional-referenced-request-bodies` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/optional-referenced-request-bodies/custom.rs    ← Your command handlers (protected by .fernignore)
cli/optional-referenced-request-bodies/sdk.rs       ← Generated bridge: client() + block_on()
cli/optional-referenced-request-bodies/main.rs      ← Generated entrypoint (calls custom::register)
optional-referenced-request-bodies-sdk/             ← Co-generated typed SDK crate
optional-referenced-request-bodies-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/optional-referenced-request-bodies/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use optional_referenced_request_bodies_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("my-command")
            .about("Description of your command")
            .arg(clap::Arg::new("id").required(true)),
        |matches, ctx| {
            let id = matches.get_one::<String>("id").unwrap();
            let client = super::sdk::client(ctx);
            let result = super::sdk::block_on(
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

The `super::sdk::client(ctx)` call returns a `optional_referenced_request_bodies_sdk::api::Client`
with the following sub-clients:

(Sub-clients are derived from the API spec at generation time.)

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
use optional_referenced_request_bodies_sdk::api::*;
```

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/optional-referenced-request-bodies/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/optional-referenced-request-bodies/sdk.rs` | Yes | Bridges AppContext → SDK client |
| `cli/optional-referenced-request-bodies/main.rs` | Yes | Calls `custom::register(app)` |
| `optional-referenced-request-bodies-sdk/` | Yes | Co-generated typed SDK crate |
| `optional-referenced-request-bodies-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
optional-referenced-request-bodies <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug optional-referenced-request-bodies <your-command> [args]
```
