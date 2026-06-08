---
name: api-custom-commands
description: How to author custom commands for the api CLI using the co-generated SDK.
---

# Custom Commands for `api`

## Overview

The `api` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/api/custom.rs    ← Your command handlers (protected by .fernignore)
cli/api/sdk_glue.rs  ← Generated bridge: sdk_client() + block_on()
cli/api/main.rs      ← Generated entrypoint (calls custom::register)
api-sdk/             ← Co-generated typed SDK crate
api-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/api/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use api_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("get-movie")
            .about("Run imdb get-movie")
            .arg(clap::Arg::new("movieId").required(true))
        ,
        |matches, ctx| {
            let movie_id = matches.get_one::<String>("movieId").unwrap();
            let client = super::sdk_glue::sdk_client(ctx);
            let result = super::sdk_glue::block_on(
                client.imdb.get_movie(movie_id),
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
api get-movie <movieId>
```

### 2. Available SDK Clients

The `sdk_glue::sdk_client(ctx)` call returns a `api_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.imdb` | `api_sdk::api::ImdbClient` | imdb operations |

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
use api_sdk::api::*;
```

### 4. Authentication

Custom commands automatically inherit the CLI's authentication.
The following auth schemes are configured:

- **bearer** (bearer): env `API_TOKEN`

No manual auth wiring is needed in custom command handlers.

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/api/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/api/sdk_glue.rs` | Yes | Bridges AppContext → SDK client |
| `cli/api/main.rs` | Yes | Calls `custom::register(app)` |
| `api-sdk/` | Yes | Co-generated typed SDK crate |
| `api-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
api <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug api <your-command> [args]
```
