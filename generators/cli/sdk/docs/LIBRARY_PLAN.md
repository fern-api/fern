# Library/Binary Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `fern-cli-sdk` into a reusable library with a `CliApp` builder API, and a thin `box` binary that consumes it.

**Architecture:** Add `[lib]` target alongside the existing `[[bin]]`. Extract the wiring logic from `main.rs` into a new `src/app.rs` module exposing `CliApp` and `AppContext`. Move the Calendly binary to `cli/box/main.rs` as a ~10-line consumer. Rename `GwsError` → `CliError` across all files.

**Tech Stack:** Rust, clap 4, tokio, reqwest

**Spec:** `LIBRARY_DESIGN.md`

---

### Task 1: Rename `GwsError` → `CliError`

Mechanical find-replace across all source and test files. Do this first so all subsequent code uses the new name.

**Files:**
- Modify: `src/error.rs`
- Modify: `src/executor.rs`
- Modify: `src/openapi.rs`
- Modify: `src/commands.rs`
- Modify: `src/discovery.rs`
- Modify: `src/formatter.rs`
- Modify: `src/validate.rs`
- Modify: `src/client.rs`
- Modify: `src/output.rs`
- Modify: `src/main.rs`
- Modify: `tests/cli_integration.rs`

- [ ] **Step 1: Rename in `src/error.rs`**

Change the enum definition and all internal references:
```rust
// Before
pub enum GwsError {
// After
pub enum CliError {
```

Also rename in the `impl` blocks, `error_label`, `print_error_json`, and test functions. The `thiserror` derives and match arms all reference `GwsError` — update every occurrence.

- [ ] **Step 2: Rename in all other source files**

Run a find-replace of `GwsError` → `CliError` across every `.rs` file in `src/`. Key files:
- `executor.rs` — error construction in `handle_error_response`, `build_url`, etc.
- `validate.rs` — return types
- `openapi.rs` — return type of `load_openapi_spec`
- `client.rs` — return type of `build_client`
- `output.rs` — `reject_dangerous_chars` return type
- `main.rs` — `use error::CliError`, `run()` return type, all match arms

- [ ] **Step 3: Verify**

Run: `nix develop --command cargo test`
Expected: All 192 tests pass with no `GwsError` references remaining.

- [ ] **Step 4: Commit**

```
git add -A && git commit -m "refactor: rename GwsError to CliError"
```

---

### Task 2: Create `src/lib.rs` and restructure modules

Replace `src/main.rs` module declarations with `src/lib.rs`. The `main.rs` temporarily becomes a thin wrapper that calls into the library.

**Files:**
- Create: `src/lib.rs`
- Modify: `src/main.rs` (strip module declarations, add `use fern_cli_sdk::*`)

- [ ] **Step 1: Create `src/lib.rs`**

```rust
//! Fern CLI SDK
//!
//! A library for building CLIs from OpenAPI specs.
//! Uses `x-fern-sdk-group-name` and `x-fern-sdk-method-name` extensions
//! to build the command hierarchy.

// Public API — building blocks
pub mod client;
pub mod commands;
pub mod discovery;
pub mod error;
pub mod executor;
pub mod formatter;
pub mod openapi;
pub mod validate;

// Internal modules
pub(crate) mod logging;
pub(crate) mod output;
pub(crate) mod text;
```

- [ ] **Step 2: Strip module declarations from `src/main.rs`**

Replace all the `mod` declarations with a single `use`:

```rust
use fern_cli_sdk::error::{print_error_json, CliError};
use fern_cli_sdk::{commands, discovery, executor, formatter, openapi, validate};
```

Remove the `mod` lines for `client`, `commands`, `discovery`, `error`, `executor`, `formatter`, `logging`, `openapi`, `output`, `text`, `validate`. Keep all the function bodies intact — they now reference types via `fern_cli_sdk::`.

Update `run()` to call `fern_cli_sdk::logging::init_logging()` — but since `logging` is `pub(crate)`, the binary can't access it directly. Instead, add a public `pub fn init_logging()` re-export in `lib.rs` or make `logging` public. Simplest: add to `lib.rs`:

```rust
/// Initialize logging from environment variables. Call once at startup.
pub fn init_logging() {
    logging::init_logging();
}
```

- [ ] **Step 3: Add `[lib]` target to `Cargo.toml`**

Add before the `[[bin]]` section:

```toml
[lib]
name = "fern_cli_sdk"
path = "src/lib.rs"
```

- [ ] **Step 4: Fix compilation**

The binary (`src/main.rs`) now imports from the library. Fix any `crate::` references in `main.rs` — they should become `fern_cli_sdk::` or use the top-level `use` imports. Specifically:
- `crate::validate::validate_safe_file_path` → `validate::validate_safe_file_path`
- `crate::error::EXIT_CODE_DOCUMENTATION` → `fern_cli_sdk::error::EXIT_CODE_DOCUMENTATION`

Run: `nix develop --command cargo build`
Fix any errors iteratively.

- [ ] **Step 5: Verify**

Run: `nix develop --command cargo test`
Expected: All tests pass. The library compiles as a separate target.

- [ ] **Step 6: Commit**

```
git add -A && git commit -m "refactor: extract library crate with pub module exports"
```

---

### Task 3: Create `src/app.rs` with `CliApp` and `AppContext`

Extract the wiring logic from `main.rs` into the library's `CliApp` builder.

**Files:**
- Create: `src/app.rs`
- Modify: `src/lib.rs` (add `mod app; pub use app::*;`)
- Modify: `src/main.rs` (simplify to use `CliApp`)

- [ ] **Step 1: Write test for `CliApp`**

Add to `src/app.rs` (will be created in step 3):

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cli_app_builds_command_tree() {
        let yaml = include_str!("../openapi/openapi.yaml");
        let app = CliApp::new("test-cli").spec(yaml);
        let doc = crate::openapi::load_openapi_spec(&app.spec_yaml, &app.name).unwrap();
        let cmd = crate::commands::build_cli(&doc);
        assert!(cmd.find_subcommand("users").is_some());
        assert!(cmd.find_subcommand("scheduled-events").is_some());
    }

    #[test]
    fn test_cli_app_with_custom_command() {
        let yaml = include_str!("../openapi/openapi.yaml");
        let app = CliApp::new("test-cli")
            .spec(yaml)
            .command(
                clap::Command::new("whoami").about("test custom command"),
                |_args, _ctx| Ok(()),
            );
        assert_eq!(app.custom_commands.len(), 1);
    }

    #[test]
    fn test_app_context_spec_access() {
        let yaml = include_str!("../openapi/openapi.yaml");
        let doc = crate::openapi::load_openapi_spec(yaml, "test").unwrap();
        let ctx = AppContext {
            doc,
            token: Some("test-token".to_string()),
            output_format: crate::formatter::OutputFormat::Json,
            pagination: crate::executor::PaginationConfig::default(),
        };
        assert_eq!(ctx.spec().name, "test");
        assert_eq!(ctx.token(), Some("test-token"));
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `nix develop --command cargo test -- app::tests`
Expected: Compilation error — `app` module doesn't exist yet.

- [ ] **Step 3: Implement `src/app.rs`**

```rust
//! High-level CLI application builder.
//!
//! `CliApp` is the primary entry point for customers building a CLI
//! from an OpenAPI spec. `AppContext` is the runtime handle passed
//! to custom command handlers.

use clap::Command;
use serde_json::Value;

use crate::discovery::RestDescription;
use crate::error::CliError;
use crate::executor::{self, AuthMethod, PaginationConfig};
use crate::formatter::OutputFormat;

/// Function signature for custom command handlers.
pub type HandlerFn = fn(&clap::ArgMatches, &AppContext) -> Result<(), CliError>;

/// Builder for constructing a CLI application from an OpenAPI spec.
pub struct CliApp {
    pub(crate) name: String,
    pub(crate) spec_yaml: String,
    auth_env_var: Option<String>,
    pub(crate) custom_commands: Vec<(Command, HandlerFn)>,
}

impl CliApp {
    /// Create a new CLI application with the given binary name.
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            spec_yaml: String::new(),
            auth_env_var: None,
            custom_commands: Vec::new(),
        }
    }

    /// Set the OpenAPI spec YAML content. Typically called with `include_str!`.
    pub fn spec(mut self, yaml: &str) -> Self {
        self.spec_yaml = yaml.to_string();
        self
    }

    /// Set the environment variable name for bearer token authentication.
    pub fn auth_env(mut self, var_name: &str) -> Self {
        self.auth_env_var = Some(var_name.to_string());
        self
    }

    /// Register a custom command with its handler.
    pub fn command(mut self, cmd: Command, handler: HandlerFn) -> Self {
        self.custom_commands.push((cmd, handler));
        self
    }

    /// Run the CLI application. This parses args, dispatches commands,
    /// and exits the process with the appropriate exit code.
    pub fn run(self) {
        let _ = dotenvy::dotenv();
        crate::logging::init_logging();

        let rt = tokio::runtime::Runtime::new().expect("Failed to create tokio runtime");
        if let Err(err) = rt.block_on(self.run_async()) {
            crate::error::print_error_json(&err);
            std::process::exit(err.exit_code());
        }
    }

    async fn run_async(self) -> Result<(), CliError> {
        let args: Vec<String> = std::env::args().collect();

        // Handle --version early
        if args.iter().any(|a| matches!(a.as_str(), "--version" | "-V" | "version")) {
            println!("{} {}", self.name, env!("CARGO_PKG_VERSION"));
            return Ok(());
        }

        // Parse spec
        let doc = crate::openapi::load_openapi_spec(&self.spec_yaml, &self.name)?;

        // Build command tree
        let mut cli = crate::commands::build_cli(&doc);

        // Inject custom commands
        for (cmd, _) in &self.custom_commands {
            cli = cli.subcommand(cmd.clone());
        }

        // Parse args
        let matches = cli.try_get_matches_from(&args).map_err(|e| {
            if e.kind() == clap::error::ErrorKind::DisplayHelp
                || e.kind() == clap::error::ErrorKind::DisplayVersion
            {
                print!("{e}");
                std::process::exit(0);
            }
            CliError::Validation(e.to_string())
        })?;

        // Resolve output format
        let output_format = match matches.get_one::<String>("format") {
            Some(s) => match OutputFormat::parse(s) {
                Ok(fmt) => fmt,
                Err(unknown) => {
                    eprintln!("warning: unknown output format '{unknown}'; falling back to json");
                    OutputFormat::Json
                }
            },
            None => OutputFormat::default(),
        };

        // Build pagination config
        let pagination = PaginationConfig {
            page_all: false, // overridden per-method below
            page_limit: 10,
            page_delay_ms: 100,
            token_query_param: doc
                .pagination_token_query_param
                .clone()
                .unwrap_or_else(|| "pageToken".to_string()),
            token_response_path: doc
                .pagination_token_response_path
                .clone()
                .unwrap_or_else(|| "nextPageToken".to_string()),
        };

        // Resolve auth
        let token = self
            .auth_env_var
            .as_ref()
            .and_then(|var| std::env::var(var).ok());
        let auth_method = if token.is_some() {
            AuthMethod::OAuth
        } else {
            AuthMethod::None
        };

        // Build context for custom command handlers
        let ctx = AppContext {
            doc,
            token: token.clone(),
            output_format: output_format.clone(),
            pagination: pagination.clone(),
        };

        // Check custom commands first
        for (cmd_def, handler) in &self.custom_commands {
            if let Some((name, sub_matches)) = matches.subcommand() {
                if name == cmd_def.get_name() {
                    return handler(sub_matches, &ctx);
                }
            }
        }

        // Resolve API method from subcommand tree
        let (method, matched_args) = resolve_method_from_matches(&ctx.doc, &matches)?;

        let params_json = matched_args.get_one::<String>("params").map(|s| s.as_str());
        let body_json = matched_args
            .try_get_one::<String>("json")
            .ok()
            .flatten()
            .map(|s| s.as_str());
        let output_path = matched_args.get_one::<String>("output").map(|s| s.as_str());

        let output_path_buf = if let Some(p) = output_path {
            Some(crate::validate::validate_safe_file_path(p, "--output")?)
        } else {
            None
        };
        let output_path = output_path_buf.as_deref().and_then(|p| p.to_str());

        let dry_run = matched_args.get_flag("dry-run");

        // Override pagination from per-method flags
        let method_pagination = PaginationConfig {
            page_all: matched_args.get_flag("page-all"),
            page_limit: matched_args.get_one::<u32>("page-limit").copied().unwrap_or(pagination.page_limit),
            page_delay_ms: matched_args.get_one::<u64>("page-delay").copied().unwrap_or(pagination.page_delay_ms),
            ..pagination
        };

        executor::execute_method(
            &ctx.doc,
            method,
            params_json,
            body_json,
            token.as_deref(),
            auth_method,
            output_path,
            None,
            dry_run,
            &method_pagination,
            &output_format,
            false,
        )
        .await
        .map(|_| ())
    }
}

/// Runtime context available to custom command handlers.
pub struct AppContext {
    pub(crate) doc: RestDescription,
    pub(crate) token: Option<String>,
    pub(crate) output_format: OutputFormat,
    pub(crate) pagination: PaginationConfig,
}

impl AppContext {
    /// Execute an API method by group and method name.
    pub fn execute(
        &self,
        group: &str,
        method_name: &str,
        params: Option<&str>,
        body: Option<&str>,
    ) -> Result<Option<Value>, CliError> {
        let resource = self.doc.resources.get(group).ok_or_else(|| {
            CliError::Validation(format!("Resource group '{group}' not found"))
        })?;
        let method = resource.methods.get(method_name).ok_or_else(|| {
            CliError::Validation(format!("Method '{method_name}' not found in '{group}'"))
        })?;

        let auth_method = if self.token.is_some() {
            AuthMethod::OAuth
        } else {
            AuthMethod::None
        };

        let rt = tokio::runtime::Handle::current();
        rt.block_on(executor::execute_method(
            &self.doc,
            method,
            params,
            body,
            self.token.as_deref(),
            auth_method,
            None,
            None,
            false,
            &self.pagination,
            &self.output_format,
            true, // capture output
        ))
    }

    /// Access the loaded API spec.
    pub fn spec(&self) -> &RestDescription {
        &self.doc
    }

    /// Access the auth token, if set.
    pub fn token(&self) -> Option<&str> {
        self.token.as_deref()
    }
}

/// Recursively walks clap ArgMatches to find the leaf API method.
pub fn resolve_method_from_matches<'a>(
    doc: &'a RestDescription,
    matches: &'a clap::ArgMatches,
) -> Result<(&'a crate::discovery::RestMethod, &'a clap::ArgMatches), CliError> {
    let mut path: Vec<&str> = Vec::new();
    let mut current_matches = matches;

    while let Some((sub_name, sub_matches)) = current_matches.subcommand() {
        path.push(sub_name);
        current_matches = sub_matches;
    }

    if path.is_empty() {
        return Err(CliError::Validation(
            "No resource or method specified".to_string(),
        ));
    }

    let resource_name = path[0];
    let resource = doc
        .resources
        .get(resource_name)
        .ok_or_else(|| CliError::Validation(format!("Resource '{resource_name}' not found")))?;

    let mut current_resource = resource;

    for &name in &path[1..path.len() - 1] {
        if let Some(sub) = current_resource.resources.get(name) {
            current_resource = sub;
        } else {
            return Err(CliError::Validation(format!(
                "Sub-resource '{name}' not found"
            )));
        }
    }

    let method_name = path[path.len() - 1];

    if let Some(method) = current_resource.methods.get(method_name) {
        return Ok((method, current_matches));
    }

    Err(CliError::Validation(format!(
        "Method '{method_name}' not found on resource. Available methods: {:?}",
        current_resource.methods.keys().collect::<Vec<_>>()
    )))
}

// Tests at the top of this task description
```

- [ ] **Step 4: Add `app` module to `lib.rs`**

Add at the top of `src/lib.rs`:
```rust
mod app;
pub use app::{AppContext, CliApp, HandlerFn, resolve_method_from_matches};
```

- [ ] **Step 5: Make `OutputFormat` cloneable**

`AppContext` stores `OutputFormat` which needs to be `Clone`. Check if it already derives `Clone` in `src/formatter.rs`. If not, add `#[derive(Clone)]` to the enum.

Similarly, `PaginationConfig` needs `Clone` — check `src/executor.rs`.

- [ ] **Step 6: Verify**

Run: `nix develop --command cargo test -- app::tests`
Expected: All 3 new tests pass.

Run: `nix develop --command cargo test`
Expected: All tests pass.

- [ ] **Step 7: Commit**

```
git add -A && git commit -m "feat: add CliApp builder and AppContext for library API"
```

---

### Task 4: Move binary to `cli/box/main.rs`

Replace the large `src/main.rs` with a thin consumer in `cli/box/`.

**Files:**
- Create: `cli/box/main.rs`
- Move: `openapi/openapi.yaml` → `cli/box/openapi.yaml`
- Delete: `src/main.rs`
- Modify: `Cargo.toml` (update `[[bin]]` path)

- [ ] **Step 1: Create directory and binary**

Create `cli/box/main.rs`:

```rust
use fern_cli_sdk::CliApp;

fn main() {
    CliApp::new("box")
        .spec(include_str!("openapi.yaml"))
        .auth_env("CALENDLY_API_TOKEN")
        .run()
}
```

- [ ] **Step 2: Move the OpenAPI spec**

```bash
mkdir -p cli/box
mv openapi/openapi.yaml cli/box/openapi.yaml
rmdir openapi
```

- [ ] **Step 3: Delete `src/main.rs`**

Remove `src/main.rs` entirely. All its logic now lives in `src/app.rs` (library) or `cli/box/main.rs` (binary).

- [ ] **Step 4: Update `Cargo.toml`**

Change the `[[bin]]` path:
```toml
[[bin]]
name = "box"
path = "cli/box/main.rs"
```

- [ ] **Step 5: Update `include_str!` paths in tests**

The OpenAPI spec moved. Update any `include_str!("../openapi/openapi.yaml")` references in library test code (`src/openapi.rs`, `src/app.rs`) to the new path. Since these are library tests, they need a path relative to `src/`:

The library tests should use a path relative to the crate root. `include_str!` resolves relative to the file it's in. For `src/openapi.rs`, the path `"../cli/box/openapi.yaml"` works. Alternatively, keep a symlink or copy. The simplest approach: leave a copy at `openapi/openapi.yaml` for library tests, or adjust the test paths.

Better approach: the library tests don't need the Calendly spec specifically — they test the parser. Move the test to use an inline YAML snippet or keep the spec at `openapi/openapi.yaml` for testing only.

Simplest: keep the `openapi/` directory with the spec for library tests, and have `cli/box/` reference it via a relative path. Actually, `include_str!` in the binary can use `"../../openapi/openapi.yaml"` — but that's fragile. Best: keep one copy at `openapi/openapi.yaml` (the canonical location for tests), and the binary uses `include_str!("../../openapi/openapi.yaml")`.

OR: just keep the spec at `cli/box/openapi.yaml` and update the library test paths. Since `src/openapi.rs` tests use `include_str!("../openapi/openapi.yaml")`, change to `include_str!("../cli/box/openapi.yaml")`. Same for `src/app.rs` tests.

- [ ] **Step 6: Verify**

Run: `nix develop --command cargo build`
Run: `nix develop --command cargo test`
Run: `nix develop --command cargo run -- users get-current-user --dry-run`
Expected: All pass, binary works identically.

- [ ] **Step 7: Verify integration tests still work**

Run: `nix develop --command cargo test --test cli_integration`
Expected: All 10 integration tests pass (`CARGO_BIN_EXE_box` resolves correctly).

- [ ] **Step 8: Commit**

```
git add -A && git commit -m "refactor: move box binary to cli/box/ as thin CliApp consumer"
```

---

### Task 5: Add library-level integration test

Test that the public API works as a customer would use it.

**Files:**
- Create: `tests/lib_api.rs`

- [ ] **Step 1: Write the test**

```rust
//! Tests for the public library API surface.

use fern_cli_sdk::{CliApp, AppContext, CliError};

#[test]
fn test_cli_app_builder_chain() {
    let app = CliApp::new("test")
        .spec(include_str!("../cli/box/openapi.yaml"))
        .auth_env("TEST_TOKEN")
        .command(
            clap::Command::new("custom").about("A custom command"),
            |_args, _ctx| Ok(()),
        );

    // Verify the builder collected everything
    assert_eq!(app.name, "test");
    assert!(!app.spec_yaml.is_empty());
}

#[test]
fn test_building_blocks_accessible() {
    // Verify all public modules are importable
    let yaml = include_str!("../cli/box/openapi.yaml");
    let doc = fern_cli_sdk::openapi::load_openapi_spec(yaml, "test").unwrap();
    let cmd = fern_cli_sdk::commands::build_cli(&doc);

    assert!(cmd.find_subcommand("users").is_some());
    assert!(cmd.find_subcommand("scheduled-events").is_some());

    // Verify types are accessible
    let _format = fern_cli_sdk::formatter::OutputFormat::Json;
    let _pagination = fern_cli_sdk::executor::PaginationConfig::default();
}
```

- [ ] **Step 2: Verify**

Run: `nix develop --command cargo test --test lib_api`
Expected: Both tests pass.

- [ ] **Step 3: Commit**

```
git add -A && git commit -m "test: add library API integration tests"
```

---

### Task 6: Cleanup and final verification

**Files:**
- Modify: `AGENTS.md` (update source layout table)
- Modify: `README.md` (add library usage section)

- [ ] **Step 1: Run full verification**

```bash
nix develop --command bash -c '
  cargo build &&
  cargo clippy -- -D warnings &&
  cargo test &&
  cargo run -- users get-current-user --dry-run &&
  cargo run -- --help
'
```

Expected: All pass. Binary works. Help shows all 14 groups.

- [ ] **Step 2: Update AGENTS.md source layout**

Update the source layout table to reflect the new structure (add `app.rs`, `lib.rs`, `cli/` directory).

- [ ] **Step 3: Update README.md**

Add a "Library usage" section showing the `CliApp` builder and custom commands pattern.

- [ ] **Step 4: Commit and push**

```
git add -A && git commit -m "docs: update README and AGENTS for library/binary structure"
git push origin main
```
