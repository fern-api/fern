//! Custom command handlers.
//!
//! This file is yours to edit — it is listed in `.fernignore` so
//! `fern generate` will never overwrite your changes.
//!
//! Each handler receives an `AppContext` with `invoke()` / `execute()`
//! methods that use the CLI's native HTTP executor. Combine these with
//! the typed request/response structs from `x_fern_default_test_types` for
//! strongly-typed serialization and deserialization.

use fern_cli_sdk::app::CliApp;

/// Register custom commands on the CLI app builder.
///
/// Called from `main.rs` during startup. Add `.custom_command(...)` calls
/// here to extend the generated CLI with your own subcommands.
pub fn register(app: CliApp) -> CliApp {
    // Example using ctx.invoke() with typed request/response structs:
    //
    //   use x_fern_default_test_types::SomeRequest;
    //
    //   app.custom_command("deploy", "Run a deployment", |matches, ctx| {
    //       let method = ctx.find_method("deployments", "create")?;
    //       let req = SomeRequest { /* ... */ };
    //       let body = serde_json::to_string(&req).unwrap();
    //       let result = ctx.invoke(method, None, Some(&body), None)?;
    //       ctx.emit(&result)?;
    //       Ok(())
    //   })
    app
}
