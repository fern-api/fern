---
name: url-form-encoded-api-custom-commands
description: How to author custom commands for the url-form-encoded-api CLI using the co-generated SDK.
---

# Custom Commands for `url-form-encoded-api`

## Overview

The `url-form-encoded-api` CLI supports user-authored custom commands compiled
into the binary alongside auto-generated API commands. Commands use
**typed arguments** (`#[derive(clap::Args)]`) and the **per-command builder**
for compile-time safety. The SDK client inherits auth, retries, TLS,
base URL, and global headers — zero configuration required.

## Architecture

```
cli/url-form-encoded-api/custom.rs    ← Your command handlers (protected by .fernignore)
cli/url-form-encoded-api/sdk.rs       ← Generated bridge: client() + block_on()
cli/url-form-encoded-api/main.rs      ← Generated entrypoint (calls custom::register)
url-form-encoded-api-sdk/             ← Co-generated typed SDK crate
```

## Typed Authoring (Default)

Define arguments with `#[derive(clap::Args)]` and register via the
per-command builder. The handler receives parsed typed args + `AppContext`:

```rust
use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::error::CliError;
use fern_cli_sdk::openapi::AppContext;

#[derive(clap::Args)]
struct FetchArgs {
    /// Resource ID to fetch.
    id: String,
    /// Output format override.
    #[arg(long)]
    raw: bool,
}

fn handle_fetch(args: FetchArgs, ctx: &AppContext) -> Result<(), CliError> {
    let client = super::sdk::client(ctx)?;
    let result = super::sdk::block_on(
        client.resource.get(&args.id),
    )?;
    let pipeline = ctx.output_pipeline();
    pipeline.emit(&mut std::io::stdout(), &serde_json::to_value(&result).unwrap(), false, true)
        .map_err(|e| CliError::Other(e.into()))?;
    Ok(())
}
```

## Per-Command Builder

Register commands in `custom.rs`'s `register()` function using the
fluent builder API:

```rust
pub fn register(app: CliApp) -> CliApp {
    app
        .custom_typed::<FetchArgs>("fetch")
        .about("Fetch a resource by ID")
        .handler(handle_fetch)
        .dry_run(handle_fetch_dry_run)  // optional
        .register()
}
```

Builder methods (all optional except `.handler()`):

| Method | Purpose |
|--------|---------|
| `.about("...")` | Help text shown in `--help` |
| `.under(&["ns", "sub"])` | Nest under a custom namespace path |
| `.handler(fn)` | **Required.** Main handler |
| `.dry_run(fn)` | Handler for `--dry-run` (optional) |
| `.register()` | Finalize and return the `CliApp` |

## Custom-Only Nesting (Namespaces)

Commands can be nested under custom namespace paths using `.under()`.
The path elements are custom command groups (not generated API groups):

```rust
// Registers as: my-cli admin users list
app.custom_typed::<ListUsersArgs>("list")
    .about("List all users")
    .under(&["admin", "users"])
    .handler(handle_list_users)
    .register()
```

The namespace groups (`admin`, `admin users`) are created automatically.
Multiple commands can share a namespace path.

## Output Cohesion (`--format`, `--quiet`)

Route output through `ctx.output_pipeline()` so `--format` and `--quiet`
work without per-command boilerplate:

```rust
let pipeline = ctx.output_pipeline();
pipeline.emit(&mut std::io::stdout(), &json_value, false, true)
    .map_err(|e| CliError::Other(e.into()))?;
```

- `table` and `csv` formats assume an array-of-objects; `json`/`yaml` always work.
- A handler that doesn't use the pipeline implicitly opts out (owns its output).
- Check `ctx.is_quiet()` when emitting non-pipeline output.

## Dry-Run Safety

The CLI enforces a **default-deny** dry-run model:

- `--dry-run` with **no** `.dry_run()` handler → error before execution.
- `--dry-run` **with** a `.dry_run()` handler → runs the dry-run handler
  instead of the normal handler.
- `ctx.build_sdk_executor()` (via `super::sdk::client(ctx)?`) **refuses**
  under `--dry-run` — the SDK constructs requests opaquely and cannot preview them.

Dry-run handlers should render a preview of what *would* happen:

```rust
fn handle_fetch_dry_run(args: FetchArgs, ctx: &AppContext) -> Result<(), CliError> {
    // ctx.preview(method, params, body) builds a request preview with no HTTP.
    eprintln!("[dry-run] would fetch resource '{}'", args.id);
    Ok(())
}
```

## SDK Client

```rust
let client = super::sdk::client(ctx)?;  // fails under --dry-run
let result = super::sdk::block_on(client.resource.method(arg))?;
```

## Non-Typed Escape Hatch

For dynamic or generated-at-runtime commands, the non-typed API
(`command()` / `command_under()`) with raw `&ArgMatches` still works:

```rust
app.command(
    clap::Command::new("dynamic")
        .about("A command with dynamic arguments")
        .arg(clap::Arg::new("input").required(true)),
    |matches, ctx| {
        let input = matches.get_one::<String>("input").unwrap();
        // ...
        Ok(())
    },
)
```

Prefer the typed builder for new commands — it catches argument
mismatches at compile time.

## Regeneration Safety

| File | Regenerated? | Notes |
|------|-------------|-------|
| `cli/url-form-encoded-api/custom.rs` | **No** | Protected by `.fernignore` |
| `cli/url-form-encoded-api/sdk.rs` | Yes | Bridges AppContext → SDK client |
| `cli/url-form-encoded-api/main.rs` | Yes | Calls `custom::register(app)` |
| `url-form-encoded-api-sdk/` | Yes | Co-generated typed SDK crate |

## Build & Test

```bash
cargo build
url-form-encoded-api hello world              # top-level custom command
url-form-encoded-api admin users list --limit 5  # nested under custom namespace
url-form-encoded-api fetch my-id --format json   # output cohesion
url-form-encoded-api fetch my-id --dry-run       # dry-run preview
```
