use std::env;
use std::ffi::OsString;

use anyhow::Result;

use crate::cli;
use crate::commands;
use crate::delegate;

/// The dispatcher's static registry of Rust-native subcommand names.
///
/// Anything in this list is handled in-process. Anything else is sent to the
/// bundled fern-ts binary unchanged. Removing a name from this list (when
/// retiring a Rust impl) is intentionally a one-line change.
const RUST_NATIVE_SUBCOMMANDS: &[&str] = &[commands::doctor::NAME];

/// Top-level entry. Reads `std::env::args_os`, decides whether to handle the
/// call in Rust or forward to fern-ts, and returns.
pub fn run() -> Result<()> {
    let argv: Vec<OsString> = env::args_os().collect();
    run_with_args(argv)
}

/// Variant that takes argv explicitly so integration tests can exercise the
/// dispatch logic without spawning child Rust processes.
pub fn run_with_args(argv: Vec<OsString>) -> Result<()> {
    // The first argv element is the binary path itself — keep it for the
    // delegate path (fern-ts inspects argv[0] for its own self-name) but
    // don't feed it to clap.
    let (program, rest) = argv
        .split_first()
        .map(|(p, r)| (p.clone(), r.to_vec()))
        .unwrap_or_else(|| (OsString::from("fern"), Vec::new()));

    // Fast path 1: explicit override for debugging the wrapper itself.
    if rest.iter().any(|a| a == "--ts") {
        return delegate::exec_fern_ts(&program, &rest);
    }

    // Fast path 2: shell completion. The yargs-based TS CLI implements its
    // own completion script (`fern completion`) and we want that behavior
    // verbatim until completion is also rewritten.
    if rest.first().map(|s| s.to_string_lossy()) == Some(std::borrow::Cow::Borrowed("completion")) {
        return delegate::exec_fern_ts(&program, &rest);
    }

    // Decide based on the first positional, *not* by running clap, because
    // clap would reject unknown flags that fern-ts is happy to accept. We
    // only fall into clap once we know the command is Rust-native.
    let first_positional = rest.iter().find(|a| {
        let s = a.to_string_lossy();
        !s.starts_with('-')
    });

    let dispatch_to_rust = first_positional
        .map(|cmd| {
            let s = cmd.to_string_lossy();
            RUST_NATIVE_SUBCOMMANDS.contains(&s.as_ref())
        })
        .unwrap_or(false);

    if !dispatch_to_rust {
        return delegate::exec_fern_ts(&program, &rest);
    }

    // Rust-native path — let clap take over for nice error messages.
    let matches = match cli::build().try_get_matches_from(argv) {
        Ok(m) => m,
        Err(err) => {
            // clap models `--help` and `--version` as "errors" but they're
            // not actually user errors — they should print to stdout and
            // exit cleanly. Anything else is a real parse failure.
            err.exit();
        }
    };
    match matches.subcommand() {
        Some((commands::doctor::NAME, sub_m)) => commands::doctor::run(sub_m),
        // This branch is unreachable in practice because we filter the
        // first positional against RUST_NATIVE_SUBCOMMANDS above, but a
        // defensive fallback keeps the type system happy and protects us
        // if the two lists ever drift.
        _ => delegate::exec_fern_ts(&program, &rest),
    }
}
