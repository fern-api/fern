//! The `<PREFIX>_*` environment variables a generated CLI reads outside of
//! its clap arguments, in one place.
//!
//! clap documents an env var only when it is attached to an `Arg` via
//! `.env()`. The transport knobs are read directly from the process
//! environment by [`crate::http`], `--retries` resolves its env fallback by
//! hand in `binding.rs`, and `<PREFIX>_OUTPUT` is read by the formatter — so
//! none of them surface in `--help` on their own. Both the root `--help`
//! footer and the `profiles set` rejection message render from this table so
//! the two cannot disagree about what exists or where it can be stored.

use crate::text::env_var_prefix;

/// Where a value for the variable can live.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EnvScope {
    /// Process environment only.
    Global,
    /// Process environment, or stored per profile via `profiles set`.
    Profile,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct EnvVarDoc {
    /// Fully-prefixed name, e.g. `TWILIO_CLI_RETRIES`.
    pub name: String,
    pub help: String,
    pub scope: EnvScope,
}

/// Suffixes of the fixed runtime variables that `profiles set` can persist.
/// `classify_key` matches on exactly these.
pub const PROFILE_SUFFIXES: [&str; 3] = ["RETRIES", "BASE_URL", "OUTPUT"];

/// Every fixed runtime variable for `cli_name`, in display order. Auth env
/// vars and `servers[].variables` are spec-derived and appended by callers
/// that have the bindings in hand.
pub fn runtime_env_vars(cli_name: &str) -> Vec<EnvVarDoc> {
    let prefix = env_var_prefix(cli_name);
    let doc = |suffix: &str, help: &str, scope: EnvScope| EnvVarDoc {
        name: format!("{prefix}_{suffix}"),
        help: help.to_string(),
        scope,
    };
    vec![
        doc("BASE_URL", "Override the API base URL", EnvScope::Profile),
        doc(
            "OUTPUT",
            "Default output format when --format is not passed",
            EnvScope::Profile,
        ),
        doc(
            "RETRIES",
            "Additional attempts after a failed request (--retries wins)",
            EnvScope::Profile,
        ),
        doc(
            "CA_BUNDLE",
            "Path to PEM file with extra trust roots (or SSL_CERT_FILE)",
            EnvScope::Global,
        ),
        doc(
            "INSECURE=1",
            "Skip TLS verification (debugging only)",
            EnvScope::Global,
        ),
        doc("PROXY", "HTTP(S) proxy URL", EnvScope::Global),
        doc("TIMEOUT_SECS", "Total request timeout", EnvScope::Global),
        doc(
            "CONNECT_TIMEOUT_SECS",
            "Connection-establishment timeout",
            EnvScope::Global,
        ),
        doc(
            "LOG",
            "Log filter directive for stderr (e.g. debug)",
            EnvScope::Global,
        ),
        EnvVarDoc {
            name: format!("{prefix}{}", crate::user_agent::suffix_env_segment()),
            help: format!(
                "Product token appended to the User-Agent (e.g. my-app/1.0; --{} wins)",
                crate::user_agent::suffix_flag()
            ),
            scope: EnvScope::Global,
        },
    ]
}

/// The fixed runtime variables that `profiles set` accepts.
pub fn profile_settable_env_vars(cli_name: &str) -> Vec<String> {
    runtime_env_vars(cli_name)
        .into_iter()
        .filter(|v| v.scope == EnvScope::Profile)
        .map(|v| v.name)
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn profile_settable_matches_classify_suffixes() {
        let names = profile_settable_env_vars("twilio-cli");
        let mut expected: Vec<String> = PROFILE_SUFFIXES
            .iter()
            .map(|s| format!("TWILIO_CLI_{s}"))
            .collect();
        expected.sort();
        let mut names = names;
        names.sort();
        assert_eq!(names, expected);
    }

    #[test]
    fn retries_is_listed() {
        assert!(runtime_env_vars("twilio-cli")
            .iter()
            .any(|v| v.name == "TWILIO_CLI_RETRIES"));
    }
}
