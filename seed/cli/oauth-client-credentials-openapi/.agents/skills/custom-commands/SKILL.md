---
name: oauth-client-credentials-openapi-custom-commands
description: How to author custom commands for the oauth-client-credentials-openapi CLI using the co-generated SDK.
---

# Custom Commands for `oauth-client-credentials-openapi`

## Overview

The `oauth-client-credentials-openapi` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/oauth-client-credentials-openapi/custom.rs    ← Your command handlers (protected by .fernignore)
cli/oauth-client-credentials-openapi/sdk_glue.rs  ← Generated bridge: sdk_client() + block_on()
cli/oauth-client-credentials-openapi/main.rs      ← Generated entrypoint (calls custom::register)
oauth-client-credentials-openapi-sdk/             ← Co-generated typed SDK crate
oauth-client-credentials-openapi-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/oauth-client-credentials-openapi/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use oauth_client_credentials_openapi_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("get")
            .about("Get a plant by ID")
            .arg(clap::Arg::new("plantId").required(true))
        ,
        |matches, ctx| {
            let plant_id = matches.get_one::<String>("plantId").unwrap();
            let client = super::sdk_glue::sdk_client(ctx);
            let result = super::sdk_glue::block_on(
                client.plants.get(plant_id),
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
oauth-client-credentials-openapi get <plantId>
```

### 2. Available SDK Clients

The `sdk_glue::sdk_client(ctx)` call returns a `oauth_client_credentials_openapi_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.identity` | `oauth_client_credentials_openapi_sdk::api::IdentityClient` | identity operations |
| `client.plants` | `oauth_client_credentials_openapi_sdk::api::PlantsClient` | plants operations |

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
use oauth_client_credentials_openapi_sdk::api::*;
```

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/oauth-client-credentials-openapi/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/oauth-client-credentials-openapi/sdk_glue.rs` | Yes | Bridges AppContext → SDK client |
| `cli/oauth-client-credentials-openapi/main.rs` | Yes | Calls `custom::register(app)` |
| `oauth-client-credentials-openapi-sdk/` | Yes | Co-generated typed SDK crate |
| `oauth-client-credentials-openapi-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
oauth-client-credentials-openapi <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug oauth-client-credentials-openapi <your-command> [args]
```
