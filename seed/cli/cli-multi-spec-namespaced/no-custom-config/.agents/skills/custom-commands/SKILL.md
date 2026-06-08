---
name: acme-versioned-custom-commands
description: How to author custom commands for the acme-versioned CLI using the co-generated SDK.
---

# Custom Commands for `acme-versioned`

## Overview

The `acme-versioned` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/acme-versioned/custom.rs    ← Your command handlers (protected by .fernignore)
cli/acme-versioned/sdk_glue.rs  ← Generated bridge: sdk_client() + block_on()
cli/acme-versioned/main.rs      ← Generated entrypoint (calls custom::register)
acme-versioned-sdk/             ← Co-generated typed SDK crate
acme-versioned-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/acme-versioned/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use acme_versioned_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("my-command")
            .about("Description of your command")
            .arg(clap::Arg::new("id").required(true)),
        |matches, ctx| {
            let id = matches.get_one::<String>("id").unwrap();
            let client = super::sdk_glue::sdk_client(ctx);
            let result = super::sdk_glue::block_on(
                client.v1.get(id),
            )?;
            println!("{}", serde_json::to_string_pretty(&result).unwrap());
            Ok(())
        },
    );
    app
}
```

### 2. Available SDK Clients

The `sdk_glue::sdk_client(ctx)` call returns a `acme_versioned_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.v1` | `acme_versioned_sdk::api::V1Client` | v1 operations |
| `client.v2` | `acme_versioned_sdk::api::V2Client` | v2 operations |

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
use acme_versioned_sdk::api::*;
```

### 4. Authentication

Custom commands automatically inherit the CLI's authentication.
The following auth schemes are configured:

- **bearerAuth** (bearer): env `ACME_VERSIONED_TOKEN`

No manual auth wiring is needed in custom command handlers.

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/acme-versioned/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/acme-versioned/sdk_glue.rs` | Yes | Bridges AppContext → SDK client |
| `cli/acme-versioned/main.rs` | Yes | Calls `custom::register(app)` |
| `acme-versioned-sdk/` | Yes | Co-generated typed SDK crate |
| `acme-versioned-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
acme-versioned <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug acme-versioned <your-command> [args]
```
