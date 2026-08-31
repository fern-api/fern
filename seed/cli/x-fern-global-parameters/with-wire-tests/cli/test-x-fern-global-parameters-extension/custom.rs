//! Custom command handlers.
//!
//! This file is yours to edit — add it to `.fernignore` so
//! `fern generate` will never overwrite your changes.
//!
//! The generated `main.rs` calls `custom::register(app)` at
//! startup, composing your commands into the CLI at compile time.
//!
//! Each handler receives an `AppContext`. Use `super::sdk::client(ctx)`
//! to get a fully-wired SDK client that inherits the CLI's auth,
//! retries, TLS, and global headers. Use `super::sdk::block_on(future)`
//! to run async SDK calls from synchronous handler context.
//! Types are available via `test_x_fern_global_parameters_extension_sdk::api::*`.

use fern_cli_sdk::app::CliApp;

/// Register custom commands on the CLI app builder.
///
/// Called from `main.rs` during startup. Uncomment the example
/// below and adapt it to your API to get started.
pub fn register(app: CliApp) -> CliApp {
    // Example: typed SDK client usage with the co-generated SDK.
    //
    // use test_x_fern_global_parameters_extension_sdk::api::*;
    //
    // let app = app.command(
    //     clap::Command::new("get-plant")
    //         .about("Fetch a plant by its ID")
    //         .arg(clap::Arg::new("plant-id").required(true)),
    //     // `command` takes a `CliCommandHandler`, which is a boxed
    //     // `Fn(&ArgMatches, &dyn Any)`. `OpenApiBinding::handler` wraps
    //     // your closure and downcasts the context to `&AppContext`, so a
    //     // bare closure here will not compile.
    //     fern_cli_sdk::openapi::OpenApiBinding::handler(|matches, ctx| {
    //         let plant_id = matches.get_one::<String>("plant-id").unwrap();
    //         let client = super::sdk::client(ctx);
    //         let plant = super::sdk::block_on(
    //             client.plants.get_plant(plant_id, None),
    //         )?;
    //         println!("{}", serde_json::to_string_pretty(&plant).unwrap());
    //         Ok(())
    //     }),
    // );
    app
}
