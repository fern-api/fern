# Design: Library/Binary Split

## Problem

The `fern-cli-sdk` crate is currently a single binary. All the reusable machinery (OpenAPI parsing, command building, HTTP execution, formatting) is locked inside `src/main.rs` module declarations and can't be consumed as a dependency. To ship CLIs for multiple customers — each with their own spec, auth config, and custom commands — we need to extract the reusable parts into a library.

## Approach

Use Rust's `[lib]` + `[[bin]]` pattern within the existing crate. The library (`fern_cli_sdk`) becomes the product. The Calendly binary (`box`) becomes a thin consumer that demonstrates what a customer's CLI looks like. No workspace, no separate repos — just a clean boundary within one crate.

This validates the API surface in-repo. When we're ready to publish, customers create a standalone `Cargo.toml` with `fern-cli-sdk = "x.y"` as a dependency, and their `main.rs` lifts out unchanged.

## Crate structure

```toml
# Cargo.toml
[package]
name = "fern-cli-sdk"

[lib]
name = "fern_cli_sdk"
path = "src/lib.rs"

[[bin]]
name = "box"
path = "cli/box/main.rs"
```

```
src/
  lib.rs              # public API re-exports
  app.rs              # CliApp builder + AppContext (new, ~150 lines)
  openapi.rs          # OpenAPI parser (existing)
  commands.rs         # clap command builder (existing)
  executor.rs         # HTTP execution (existing)
  discovery.rs        # internal representation types (existing)
  formatter.rs        # output formatting (existing)
  error.rs            # CliError type (existing, renamed from GwsError)
  validate.rs         # input validation (existing)
  client.rs           # HTTP client + retry (existing)
  logging.rs          # tracing setup (internal, not exported)
  output.rs           # terminal helpers (internal, not exported)
  text.rs             # string truncation (internal, not exported)
cli/
  box/
    main.rs           # ~10 lines — the "customer" binary
    openapi.yaml      # Calendly's spec (moved from openapi/)
```

## Public API

### High-level: `CliApp` builder

The primary API surface. Most customers use only this.

```rust
use fern_cli_sdk::CliApp;

fn main() {
    CliApp::new("box")
        .spec(include_str!("openapi.yaml"))
        .auth_env("CALENDLY_API_TOKEN")
        .run()
}
```

### Custom commands

Customers register additional commands via `.command()`. Custom commands appear in `--help` alongside auto-generated groups.

```rust
use clap::{Arg, Command};
use fern_cli_sdk::{CliApp, AppContext};

fn main() {
    CliApp::new("box")
        .spec(include_str!("openapi.yaml"))
        .auth_env("CALENDLY_API_TOKEN")
        .command(whoami_cmd(), whoami_handler)
        .run()
}

fn whoami_cmd() -> Command {
    Command::new("whoami").about("Show the current authenticated user")
}

fn whoami_handler(args: &clap::ArgMatches, ctx: &AppContext) -> Result<(), fern_cli_sdk::CliError> {
    ctx.execute("users", "get-current-user", None, None)?;
    Ok(())
}
```

Custom commands can be organized into separate files/modules — standard Rust module system, no framework conventions.

```
cli/
  box/
    main.rs
    commands/
      mod.rs
      whoami.rs
      schedule.rs
    openapi.yaml
```

### Low-level building blocks

For customers who need full control, all internals are accessible:

```rust
use fern_cli_sdk::openapi::load_openapi_spec;
use fern_cli_sdk::commands::build_cli;
use fern_cli_sdk::executor::{execute_method, AuthMethod, PaginationConfig};
use fern_cli_sdk::discovery::{RestDescription, RestMethod};
use fern_cli_sdk::formatter::OutputFormat;
use fern_cli_sdk::error::CliError;
```

## Key types

### `CliApp`

Builder struct configured at startup, consumed by `.run()`.

```rust
pub struct CliApp {
    name: String,
    spec_yaml: String,
    auth_env_var: Option<String>,
    custom_commands: Vec<(Command, HandlerFn)>,
}

impl CliApp {
    pub fn new(name: &str) -> Self;
    pub fn spec(self, yaml: &str) -> Self;
    pub fn auth_env(self, var_name: &str) -> Self;
    pub fn command(self, cmd: Command, handler: HandlerFn) -> Self;
    pub fn run(self);  // entry point — parses args, dispatches, exits
}
```

### `AppContext`

Runtime handle passed to custom command handlers. Provides access to the executor, auth, and loaded spec without exposing internals.

```rust
pub struct AppContext {
    doc: RestDescription,
    token: Option<String>,
    output_format: OutputFormat,
    pagination: PaginationConfig,
}

impl AppContext {
    /// Execute an API method by group and method name.
    pub fn execute(
        &self,
        group: &str,
        method: &str,
        params: Option<&str>,
        body: Option<&str>,
    ) -> Result<Option<serde_json::Value>, CliError>;

    /// Access the loaded spec for introspection.
    pub fn spec(&self) -> &RestDescription;

    /// Access the auth token.
    pub fn token(&self) -> Option<&str>;
}
```

### `HandlerFn`

```rust
pub type HandlerFn = fn(&clap::ArgMatches, &AppContext) -> Result<(), CliError>;
```

## Module visibility

```rust
// src/lib.rs

// High-level API
mod app;
pub use app::{CliApp, AppContext, HandlerFn};

// Building blocks
pub mod openapi;
pub mod commands;
pub mod executor;
pub mod discovery;
pub mod formatter;
pub mod error;
pub mod validate;
pub mod client;

// Internal (not exported)
mod logging;
mod output;
mod text;
```

## Changes to existing code

### New files
- `src/lib.rs` — re-exports
- `src/app.rs` — `CliApp` builder + `AppContext` (~150 lines, logic extracted from current `main.rs` `run()`)
- `cli/box/main.rs` — thin consumer (~10 lines)

### Moved
- `openapi/openapi.yaml` → `cli/box/openapi.yaml`

### Deleted
- `src/main.rs` — replaced by `src/lib.rs` + `cli/box/main.rs`

### Renamed
- `GwsError` → `CliError` (all files, mechanical find-replace)

### Visibility changes (mechanical)
- `mod foo` declarations in old `main.rs` become `pub mod foo` in `lib.rs` for exported modules
- `pub(crate)` items in `output.rs` stay `pub(crate)` — internal to the library
- `resolve_method_from_matches` moves into `app.rs` or becomes public in `commands`

### No logic changes
- `executor.rs`, `commands.rs`, `discovery.rs`, `formatter.rs`, `validate.rs`, `client.rs`, `openapi.rs` — logic unchanged, only module visibility changes

## Logging

The library does NOT own the global tracing subscriber. `logging::init_logging()` becomes an opt-in utility that `CliApp::run()` calls internally. Customers using the low-level API manage their own tracing setup.

## Testing

- Existing unit tests stay in their modules (they test library code now)
- Integration tests in `tests/cli_integration.rs` continue to work — `CARGO_BIN_EXE_box` resolves to the `[[bin]]` target
- Add a new test that constructs `CliApp` programmatically and verifies it builds the right command tree (tests the public API surface)

## Future: separate repos

When we're ready to publish `fern-cli-sdk` to crates.io, a customer's repo looks like:

```
box-cli/
  Cargo.toml          # fern-cli-sdk = "0.19"
  src/
    main.rs           # identical to cli/box/main.rs
    commands/         # optional custom commands
  openapi.yaml
```

The `cli/box/` directory in this repo serves as the template. The library upgrade path is just bumping the version in `Cargo.toml`.
