---
name: login-flow-custom-commands
description: How to author custom commands for the login-flow CLI using the co-generated SDK.
---

# Custom Commands for `login-flow`

## Overview

The `login-flow` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/login-flow/custom.rs    ← Your command handlers (protected by .fernignore)
cli/login-flow/sdk.rs       ← Generated bridge: client() + block_on()
cli/login-flow/main.rs      ← Generated entrypoint (calls custom::register)
login-flow-sdk/             ← Co-generated typed SDK crate
login-flow-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/login-flow/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use login_flow_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("get")
            .about("Get a widget")
            .arg(clap::Arg::new("widgetId").required(true))
        ,
        |matches, ctx| {
            let widget_id = matches.get_one::<String>("widgetId").unwrap();
            let client = super::sdk::client(ctx);
            let result = super::sdk::block_on(
                client.widgets.get(widget_id),
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
login-flow get <widgetId>
```

### 2. Available SDK Clients

The `super::sdk::client(ctx)` call returns a `login_flow_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.widgets` | `login_flow_sdk::api::WidgetsClient` | widgets operations |
| `client.tokens` | `login_flow_sdk::api::TokensClient` | tokens operations |
| `client.system` | `login_flow_sdk::api::SystemClient` | system operations |

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
use login_flow_sdk::api::*;
```

### 4. Authentication

Custom commands automatically inherit the CLI's authentication.
The following auth schemes are configured:

- **OAuth2** (oauth-authorization-code): env ``

No manual auth wiring is needed in custom command handlers.

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/login-flow/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/login-flow/sdk.rs` | Yes | Bridges AppContext → SDK client |
| `cli/login-flow/main.rs` | Yes | Calls `custom::register(app)` |
| `login-flow-sdk/` | Yes | Co-generated typed SDK crate |
| `login-flow-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
login-flow <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug login-flow <your-command> [args]
```
