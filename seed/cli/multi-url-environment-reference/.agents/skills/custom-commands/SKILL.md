---
name: multi-url-environment-reference-custom-commands
description: How to author custom commands for the multi-url-environment-reference CLI using the co-generated SDK.
---

# Custom Commands for `multi-url-environment-reference`

## Overview

The `multi-url-environment-reference` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/multi-url-environment-reference/custom.rs    ← Your command handlers (protected by .fernignore)
cli/multi-url-environment-reference/sdk_glue.rs  ← Generated bridge: sdk_client() + block_on()
cli/multi-url-environment-reference/main.rs      ← Generated entrypoint (calls custom::register)
multi-url-environment-reference-sdk/             ← Co-generated typed SDK crate
multi-url-environment-reference-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/multi-url-environment-reference/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use multi_url_environment_reference_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("list-items")
            .about("Run items list-items")
        ,
        |matches, ctx| {
            let client = super::sdk_glue::sdk_client(ctx);
            let result = super::sdk_glue::block_on(
                client.items.list_items(),
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
multi-url-environment-reference list-items
```

### 2. Available SDK Clients

The `sdk_glue::sdk_client(ctx)` call returns a `multi_url_environment_reference_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.items` | `multi_url_environment_reference_sdk::api::ItemsClient` | items operations |
| `client.auth` | `multi_url_environment_reference_sdk::api::AuthClient` | auth operations |
| `client.files` | `multi_url_environment_reference_sdk::api::FilesClient` | files operations |

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
use multi_url_environment_reference_sdk::api::*;
```

### 4. Authentication

Custom commands automatically inherit the CLI's authentication.
The following auth schemes are configured:

- **BearerAuth** (bearer): env `MULTI_URL_ENVIRONMENT_REFERENCE_TOKEN`

No manual auth wiring is needed in custom command handlers.

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/multi-url-environment-reference/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/multi-url-environment-reference/sdk_glue.rs` | Yes | Bridges AppContext → SDK client |
| `cli/multi-url-environment-reference/main.rs` | Yes | Calls `custom::register(app)` |
| `multi-url-environment-reference-sdk/` | Yes | Co-generated typed SDK crate |
| `multi-url-environment-reference-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
multi-url-environment-reference <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug multi-url-environment-reference <your-command> [args]
```
