//! Custom command handlers.
//!
//! This file is yours to edit — it is listed in `.fernignore` so
//! `fern generate` will never overwrite your changes.
//!
//! Each handler is an `async fn` that receives an `AppContext` with a
//! pre-wired, strongly-typed SDK client accessible via `ctx.client()`.
//! Return values flow through the CLI's output pipeline via `ctx.emit()`.

use fern_cli_sdk::app::CliApp;

/// Register custom commands on the CLI app builder.
///
/// Called from `main.rs` during startup. Add `.custom_command(...)` calls
/// here to extend the generated CLI with your own subcommands.
pub fn register(app: CliApp) -> CliApp {
    // Example:
    //   app.custom_command("my-cmd", "Description", |ctx| {
    //       Box::pin(async move {
    //           let client = ctx.client::<query_parameters_api_sdk::Client>();
    //           let resp = client.some_endpoint().await?;
    //           ctx.emit(&resp)?;
    //           Ok(())
    //       })
    //   })
    app
}
