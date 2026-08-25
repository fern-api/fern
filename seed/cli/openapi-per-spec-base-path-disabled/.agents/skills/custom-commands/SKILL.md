---
name: oauth-api-custom-commands
description: How to author custom commands for the oauth-api CLI using the co-generated SDK.
---

# Custom Commands for `oauth-api`

## Overview

The `oauth-api` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/oauth-api/custom.rs    ← Your command handlers (protected by .fernignore)
cli/oauth-api/sdk.rs       ← Generated bridge: client() + block_on()
cli/oauth-api/main.rs      ← Generated entrypoint (calls custom::register)
oauth-api-sdk/             ← Co-generated typed SDK crate
oauth-api-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/oauth-api/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use oauth_api_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("my-command")
            .about("Description of your command")
            .arg(clap::Arg::new("id").required(true)),
        |matches, ctx| {
            let id = matches.get_one::<String>("id").unwrap();
            let client = super::sdk::client(ctx);
            let result = super::sdk::block_on(
                client.oauth.get(id),
            )?;
            println!("{}", serde_json::to_string_pretty(&result).unwrap());
            Ok(())
        },
    );
    app
}
```

### 2. Available SDK Clients

The `super::sdk::client(ctx)` call returns a `oauth_api_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.oauth` | `oauth_api_sdk::api::OauthClient` | oauth operations |

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
use oauth_api_sdk::api::*;
```

### 4. Authentication

Custom commands automatically inherit the CLI's authentication.
The following auth schemes are configured:

- **OAuth** (oauth-client-credentials): env `OAUTH_API_CLIENT_ID`, `OAUTH_API_CLIENT_SECRET`

No manual auth wiring is needed in custom command handlers.

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/oauth-api/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/oauth-api/sdk.rs` | Yes | Bridges AppContext → SDK client |
| `cli/oauth-api/main.rs` | Yes | Calls `custom::register(app)` |
| `oauth-api-sdk/` | Yes | Co-generated typed SDK crate |
| `oauth-api-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
oauth-api <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug oauth-api <your-command> [args]
```
