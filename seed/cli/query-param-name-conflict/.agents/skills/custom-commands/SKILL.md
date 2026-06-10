---
name: query-param-name-conflict-api-custom-commands
description: How to author custom commands for the query-param-name-conflict-api CLI using the co-generated SDK.
---

# Custom Commands for `query-param-name-conflict-api`

## Overview

The `query-param-name-conflict-api` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/query-param-name-conflict-api/custom.rs    ← Your command handlers (protected by .fernignore)
cli/query-param-name-conflict-api/sdk_glue.rs  ← Generated bridge: sdk_client() + block_on()
cli/query-param-name-conflict-api/main.rs      ← Generated entrypoint (calls custom::register)
query-param-name-conflict-api-sdk/             ← Co-generated typed SDK crate
query-param-name-conflict-api-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/query-param-name-conflict-api/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use query_param_name_conflict_api_sdk::api::*;

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

The `sdk_glue::sdk_client(ctx)` call returns a `query_param_name_conflict_api_sdk::api::Client`
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
use query_param_name_conflict_api_sdk::api::*;
```

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/query-param-name-conflict-api/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/query-param-name-conflict-api/sdk_glue.rs` | Yes | Bridges AppContext → SDK client |
| `cli/query-param-name-conflict-api/main.rs` | Yes | Calls `custom::register(app)` |
| `query-param-name-conflict-api-sdk/` | Yes | Co-generated typed SDK crate |
| `query-param-name-conflict-api-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
query-param-name-conflict-api <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug query-param-name-conflict-api <your-command> [args]
```
