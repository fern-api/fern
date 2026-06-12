//! Custom command handlers.
//!
//! This file is yours to edit — add it to `.fernignore` so
//! `fern generate` will never overwrite your changes.
//!
//! The generated `main.rs` calls `custom::register(app)` at
//! startup, composing your commands into the CLI at compile time.
//! This is the same pattern used by other Fern generators (e.g.
//! Ruby's `requirePaths`) — the generated entrypoint references
//! this user-owned file, and `.fernignore` keeps it safe across
//! regenerations.
//!
//! Each handler receives an `AppContext` whose `invoke()` and
//! `execute()` methods use the CLI's native HTTP executor.
//! Combine these with the typed structs from `api_wide_base_path_with_default_types`
//! for strongly-typed request/response serialization.

use fern_cli_sdk::app::CliApp;

/// Register custom commands on the CLI app builder.
///
/// Called from `main.rs` during startup. Uncomment the example
/// below and adapt it to your API to get started.
pub fn register(app: CliApp) -> CliApp {
    // Example: fetch a resource using the native CLI executor
    // with typed response deserialization.
    //
    // use api_wide_base_path_with_default_types::*;
    //
    // let app = app.command(
    //     clap::Command::new("get-plant")
    //         .about("Fetch a plant by its ID")
    //         .arg(clap::Arg::new("plant-id").required(true)),
    //     |matches, ctx| {
    //         let plant_id = matches.get_one::<String>("plant-id").unwrap();
    //         let method = ctx.find_method("plants", "get")?;
    //         let params = serde_json::json!({
    //             "plantId": plant_id,
    //         });
    //         let result = ctx.invoke(
    //             method,
    //             Some(&params.to_string()),
    //             None,
    //             None,
    //         )?;
    //         println!("{}", serde_json::to_string_pretty(&result).unwrap());
    //         Ok(())
    //     },
    // );
    app
}
