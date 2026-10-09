---
name: header-auth-cli-custom-commands
description: How to author custom commands for the header-auth-cli CLI using the co-generated SDK.
---

# Custom Commands for `header-auth-cli`

## Overview

The `header-auth-cli` CLI supports user-authored custom commands that are
compiled into the binary alongside the auto-generated API commands.
Custom commands get a fully-wired SDK client that inherits the CLI's
auth, retries, TLS, base URL, and global headers — zero configuration required.

## Architecture

```
cli/header-auth-cli/custom.rs    ← Your command handlers (protected by .fernignore)
cli/header-auth-cli/sdk.rs       ← Generated bridge: client() + block_on()
cli/header-auth-cli/main.rs      ← Generated entrypoint (calls custom::register)
header-auth-cli-sdk/             ← Co-generated typed SDK crate
header-auth-cli-types/           ← Co-generated typed model crate
```

## Adding a Custom Command

### 1. Edit `cli/header-auth-cli/custom.rs`

This file is protected by `.fernignore` — `fern generate` will never
overwrite it. Register commands in the `register()` function:

```rust
use header_auth_cli_sdk::api::*;

pub fn register(app: CliApp) -> CliApp {
    let app = app.command(
        clap::Command::new("list")
            .about("List widgets")
        ,
        |matches, ctx| {
            let client = super::sdk::client(ctx);
            let result = super::sdk::block_on(
                client.widgets.list(),
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
header-auth-cli list
```

### 2. Available SDK Clients

The `super::sdk::client(ctx)` call returns a `header_auth_cli_sdk::api::Client`
with the following sub-clients:

| Field | Type | Description |
|-------|------|-------------|
| `client.widgets` | `header_auth_cli_sdk::api::WidgetsClient` | widgets operations |
| `client.system` | `header_auth_cli_sdk::api::SystemClient` | system operations |

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
use header_auth_cli_sdk::api::*;
```

### 4. Authentication

Custom commands automatically inherit the CLI's authentication.
The following auth schemes are configured:

- **ApiKeyAuth** (header): env `HEADER_AUTH_CLI_API_KEY`

No manual auth wiring is needed in custom command handlers.

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/header-auth-cli/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/header-auth-cli/sdk.rs` | Yes | Bridges AppContext → SDK client |
| `cli/header-auth-cli/main.rs` | Yes | Calls `custom::register(app)` |
| `header-auth-cli-sdk/` | Yes | Co-generated typed SDK crate |
| `header-auth-cli-types/` | Yes | Co-generated typed models |

After running `fern generate`, your `custom.rs` is preserved. All
generated code (SDK, types, glue, main.rs) is updated to match the
latest API spec. If the SDK surface changes (renamed methods, new
sub-clients), update your `custom.rs` to match.

## Build & Test

```bash
# Build the CLI (includes custom commands)
cargo build

# Run your custom command
header-auth-cli <your-command> [args]

# Run with verbose output for debugging
RUST_LOG=debug header-auth-cli <your-command> [args]
```
