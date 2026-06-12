---
name: openapi-request-body-ref-custom-commands
description: How to author custom commands for the openapi-request-body-ref CLI using the co-generated SDK.
---

# Custom Commands for `openapi-request-body-ref`

## Overview

The `openapi-request-body-ref` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/openapi-request-body-ref/custom.rs    ← Your command handlers (protected by .fernignore)
cli/openapi-request-body-ref/sdk_glue.rs  ← Generated bridge: sdk_client() + block_on()
cli/openapi-request-body-ref/main.rs      ← Generated entrypoint (calls custom::register)
openapi-request-body-ref-sdk/             ← Co-generated typed SDK crate
openapi-request-body-ref-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/openapi-request-body-ref/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use openapi_request_body_ref_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("get-catalog-image")
            .about("Retrieve a catalog image")
            .arg(clap::Arg::new("image_id").required(true))
        ,
        |matches, ctx| {
            let image_id = matches.get_one::<String>("image_id").unwrap();
            let client = super::sdk_glue::sdk_client(ctx);
            let result = super::sdk_glue::block_on(
                client.catalog.get_catalog_image(image_id),
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
openapi-request-body-ref get-catalog-image <image_id>
```

### 2. Available SDK Clients

The `sdk_glue::sdk_client(ctx)` call returns a `openapi_request_body_ref_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.vendor` | `openapi_request_body_ref_sdk::api::VendorClient` | vendor operations |
| `client.catalog` | `openapi_request_body_ref_sdk::api::CatalogClient` | catalog operations |
| `client.team_member` | `openapi_request_body_ref_sdk::api::TeamMemberClient` | team_member operations |

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
use openapi_request_body_ref_sdk::api::*;
```

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/openapi-request-body-ref/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/openapi-request-body-ref/sdk_glue.rs` | Yes | Bridges AppContext → SDK client |
| `cli/openapi-request-body-ref/main.rs` | Yes | Calls `custom::register(app)` |
| `openapi-request-body-ref-sdk/` | Yes | Co-generated typed SDK crate |
| `openapi-request-body-ref-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
openapi-request-body-ref <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug openapi-request-body-ref <your-command> [args]
```
