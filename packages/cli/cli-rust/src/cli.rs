use std::ffi::OsString;

use clap::{Arg, ArgAction, Command};

/// Returns the full clap definition for `fern`.
///
/// Design note: this is intentionally a `clap::Command` and not a `derive`
/// struct. We need the catch-all `external_subcommand` behavior so that any
/// flag/argument shape supported by the bundled TypeScript cli-v2 still
/// reaches it unchanged — `derive` makes that strictness harder to opt out
/// of.
pub fn build() -> Command {
    Command::new("fern")
        .version(crate::VERSION)
        .about("Instant Docs and SDKs for your API.")
        .long_about(LONG_ABOUT)
        .disable_help_subcommand(true)
        .arg_required_else_help(false)
        // Pass through unknown flags so the TS CLI can still parse them.
        // Without this, `fern check --unknown-flag` would fail at the Rust
        // layer before ever reaching the bundled binary.
        .allow_external_subcommands(true)
        .allow_hyphen_values(true)
        // Rust-native commands declared explicitly here. Everything else
        // falls through `external_subcommand` and is forwarded to fern-ts.
        .subcommand(crate::commands::doctor::command())
        // Global options that are useful regardless of which path handles
        // the invocation. `clap` will surface these in --help.
        .arg(
            Arg::new("log-level")
                .long("log-level")
                .value_name("LEVEL")
                .help("Set log level [debug, info, warn, error]")
                .global(true),
        )
        .arg(
            Arg::new("env")
                .long("env")
                .value_name("PATH")
                .help("Path to a .env file to load environment variables from")
                .global(true),
        )
        .arg(
            Arg::new("ts")
                .long("ts")
                .help("Force-route the command to the bundled TypeScript cli-v2 (debug aid).")
                .action(ArgAction::SetTrue)
                .global(true),
        )
}

/// Convenience entrypoint used by tests so they can drive the parser without
/// touching `std::env::args`.
pub fn parse(args: impl IntoIterator<Item = OsString>) -> clap::ArgMatches {
    build().get_matches_from(args)
}

const LONG_ABOUT: &str = "\
The Fern CLI is being incrementally rewritten in Rust. This binary is the
dispatcher: it handles a small (and growing) set of subcommands natively in
Rust, and forwards everything else to the bundled cli-v2 TypeScript binary
so that no existing feature is lost during the migration.

Subcommands implemented in Rust today are listed below; every other
subcommand is delegated.";
