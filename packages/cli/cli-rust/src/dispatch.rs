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

/// Global flags defined in `cli.rs` that take a value argument. When walking
/// argv to find the first *positional*, we have to skip both the flag itself
/// (already handled by the `starts_with('-')` filter) AND the value that
/// follows it — otherwise the dispatcher would treat the value as the
/// subcommand name. `--flag=value` form works automatically.
const FLAGS_WITH_VALUES: &[&str] = &["--log-level", "--env"];

/// Flag that forces routing to fern-ts even for Rust-native commands. The
/// flag itself is a dispatcher concept that the TS yargs CLI doesn't know
/// about, so we strip it before delegating.
const FORCE_TS_FLAG: &str = "--ts";

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
    // Strip `--ts` before delegating — yargs runs with `.strict()` and will
    // reject the unknown flag if we forward it verbatim.
    if rest.iter().any(|a| a == FORCE_TS_FLAG) {
        let forwarded: Vec<OsString> = rest
            .iter()
            .filter(|a| *a != FORCE_TS_FLAG)
            .cloned()
            .collect();
        return delegate::exec_fern_ts(&program, &forwarded);
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
    let first_positional = find_first_positional(&rest);

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

/// Walk argv looking for the first true positional. We skip:
///   * any token starting with `-` (this is the flag itself),
///   * the token immediately following a known value-bearing flag (the
///     value, which would otherwise look like a positional).
///
/// `--flag=value` form needs no special handling because the whole token
/// already starts with `-` and is filtered by the first rule.
fn find_first_positional(args: &[OsString]) -> Option<&OsString> {
    let mut skip_next = false;
    for arg in args {
        if skip_next {
            skip_next = false;
            continue;
        }
        let s = arg.to_string_lossy();
        if s.starts_with('-') {
            // Only consume the next token as a value if this is the bare
            // `--flag` form. `--flag=value` is self-contained.
            if FLAGS_WITH_VALUES.contains(&s.as_ref()) {
                skip_next = true;
            }
            continue;
        }
        return Some(arg);
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    fn os(s: &str) -> OsString {
        OsString::from(s)
    }

    #[test]
    fn first_positional_skips_value_bearing_flags() {
        // `--log-level debug doctor` should return `doctor`, not `debug`.
        let args = vec![os("--log-level"), os("debug"), os("doctor")];
        assert_eq!(find_first_positional(&args), Some(&os("doctor")));
    }

    #[test]
    fn first_positional_handles_equals_form() {
        // `--log-level=debug doctor` should also return `doctor`.
        let args = vec![os("--log-level=debug"), os("doctor")];
        assert_eq!(find_first_positional(&args), Some(&os("doctor")));
    }

    #[test]
    fn first_positional_with_no_flags() {
        let args = vec![os("doctor"), os("--verbose")];
        assert_eq!(find_first_positional(&args), Some(&os("doctor")));
    }

    #[test]
    fn first_positional_returns_none_when_only_flags() {
        let args = vec![os("--version")];
        assert_eq!(find_first_positional(&args), None);
    }

    #[test]
    fn first_positional_skips_env_value() {
        let args = vec![os("--env"), os(".env.local"), os("check")];
        assert_eq!(find_first_positional(&args), Some(&os("check")));
    }
}
