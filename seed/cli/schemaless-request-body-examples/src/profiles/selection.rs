//! Deciding *which* profile an invocation runs under, and publishing the
//! answer for the rest of the process.
//!
//! Resolution happens in `CliApp::run` **before** clap parses the
//! subcommand, alongside the existing pre-parse interception in
//! [`crate::early_intercept`] — the resolved profile has to be in place
//! before the clap tree is built, because it supplies `default_value`s to
//! the args in that tree.

use std::sync::{Arc, OnceLock, RwLock};

use crate::error::CliError;
use crate::profiles::store::{self, ProfileStore, ResolvedProfile};

/// Where the selected profile came from. Reported by `profiles current` and
/// in the "unknown profile" error, so a user who forgot they exported
/// `<BIN>_PROFILE` can see why they are on a tenant they did not name.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SelectionSource {
    /// `--profile` / `-p` on the command line.
    Flag,
    /// The `<BIN>_PROFILE` environment variable.
    Env,
    /// `active = "..."` in `profiles.toml`, set by `profiles use`.
    Active,
}

impl SelectionSource {
    pub fn label(self) -> &'static str {
        match self {
            SelectionSource::Flag => "--profile flag",
            SelectionSource::Env => "environment variable",
            SelectionSource::Active => "active profile",
        }
    }
}

/// A resolved profile plus how it was chosen.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Selection {
    pub profile: ResolvedProfile,
    pub source: SelectionSource,
}

/// The env var that names a profile, e.g. `TWILIO_PROFILE`. Same derivation
/// as `<NAME>_LOG` / `<NAME>_OUTPUT`.
pub fn profile_env_var(cli_name: &str) -> String {
    format!("{}_PROFILE", cli_name.to_uppercase().replace('-', "_"))
}

/// The long flag name. A constant rather than an inline literal so the
/// pre-clap scanner and the clap registration cannot drift.
pub const PROFILE_FLAG: &str = "profile";

/// `-p` is safe as the short form: spec-derived parameter args are
/// `.long()`-only (see `openapi::commands`), so there is no short-flag
/// namespace for it to collide in.
pub const PROFILE_SHORT: char = 'p';

// ── Pre-clap flag extraction ────────────────────────────────────────────

/// The value of `--profile` / `-p` in raw argv, if present.
///
/// Sniffed pre-clap for the same reason `--schema` is: the profile has to be
/// known before the command tree is built, and clap would demand the matched
/// leaf's required args before we ever got a chance to look.
///
/// Accepts every spelling clap does: `--profile v`, `--profile=v`, `-p v`,
/// `-p=v`, `-pv`. Stops at a bare `--`, after which everything is
/// positional.
///
/// Like the other raw-argv scanners in this crate, this cannot tell a flag
/// from a *value* that happens to look like one (`--body --profile`). The
/// exposure is the same as for `--schema` / `--base-url`, and the real parse
/// still happens in clap.
pub fn extract_profile_flag(args: &[String]) -> Option<String> {
    let long = format!("--{PROFILE_FLAG}");
    let long_eq = format!("{long}=");
    let short = format!("-{PROFILE_SHORT}");
    let short_eq = format!("{short}=");

    let mut iter = args.iter().skip(1);
    while let Some(arg) = iter.next() {
        if arg == "--" {
            return None;
        }
        if let Some(value) = arg.strip_prefix(&long_eq) {
            return non_empty(value);
        }
        if let Some(value) = arg.strip_prefix(&short_eq) {
            return non_empty(value);
        }
        if arg == &long || arg == &short {
            return iter.next().and_then(|v| non_empty(v));
        }
        // `-pprod` — clap's attached-value form for a short flag. Guarded on
        // an exact two-char prefix so `-page` (were such a flag to exist)
        // and the `-p=` form handled above do not fall in here.
        if let Some(rest) = arg.strip_prefix(&short) {
            if !rest.is_empty() && !rest.starts_with('-') && !rest.starts_with('=') {
                return non_empty(rest);
            }
        }
    }
    None
}

fn non_empty(s: &str) -> Option<String> {
    let trimmed = s.trim();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed.to_string())
    }
}

// ── Resolution ──────────────────────────────────────────────────────────

/// Resolve the profile for this invocation.
///
/// ```text
/// --profile / -p  →  <BIN>_PROFILE  →  active in profiles.toml  →  None
/// ```
///
/// `Ok(None)` means "no profile", which is not an error — it is the state
/// every existing generated CLI is in, and it must behave exactly as before.
///
/// A profile that is *named* but absent is always an error, never a silent
/// fallthrough to env vars. Falling through would send the request with the
/// caller's default credentials against a tenant they did not choose, and
/// they would not find out until they read the response.
pub fn resolve_selection(
    cli_name: &str,
    args: &[String],
) -> Result<Option<Selection>, CliError> {
    let store = match ProfileStore::for_cli(cli_name) {
        Some(store) => store,
        // No home directory — no profiles, same as an empty file.
        None => return Ok(None),
    };
    resolve_selection_in(&store, cli_name, args)
}

/// [`resolve_selection`] against an explicit store. The unit-testable seam.
pub fn resolve_selection_in(
    store: &ProfileStore,
    cli_name: &str,
    args: &[String],
) -> Result<Option<Selection>, CliError> {
    let (name, source) = if let Some(name) = extract_profile_flag(args) {
        (name, SelectionSource::Flag)
    } else if let Some(name) = std::env::var(profile_env_var(cli_name))
        .ok()
        .and_then(|v| non_empty(&v))
    {
        (name, SelectionSource::Env)
    } else if let Some(name) = store.active() {
        (name.to_string(), SelectionSource::Active)
    } else {
        return Ok(None);
    };

    let profile = store::resolve(store, &name).map_err(|e| annotate(e, source, cli_name))?;
    Ok(Some(Selection { profile, source }))
}

/// Say where the offending name came from. An error about `-p nope` is
/// self-explanatory; the same error from a stale `active` or an exported
/// `TWILIO_PROFILE` is not.
fn annotate(error: CliError, source: SelectionSource, cli_name: &str) -> CliError {
    let hint = match source {
        SelectionSource::Flag => return error,
        SelectionSource::Env => format!(
            " (named by the {} environment variable)",
            profile_env_var(cli_name),
        ),
        SelectionSource::Active => format!(
            " (the active profile — run `{cli_name} profiles use <name>` to change it)",
        ),
    };
    match error {
        CliError::Validation(message) => CliError::Validation(format!("{message}{hint}")),
        other => other,
    }
}

// ── Process-global slot ─────────────────────────────────────────────────

/// The resolved profile for this process, installed once by `CliApp::run`.
///
/// `OnceLock<RwLock<…>>` rather than a plain `OnceLock` so tests can swap
/// it — exactly the shape
/// [`crate::auth::keyring_store::ACTIVE_STORE`](crate::auth::keyring_store)
/// uses, and for the same reason.
static ACTIVE_PROFILE: OnceLock<RwLock<Option<Arc<ResolvedProfile>>>> = OnceLock::new();

fn slot() -> &'static RwLock<Option<Arc<ResolvedProfile>>> {
    ACTIVE_PROFILE.get_or_init(|| RwLock::new(None))
}

/// Publish the resolved profile. Called by `CliApp::run` before
/// `propagate_root_auth`, because the keyring account and the OAuth
/// token-cache key are both derived from it at that point.
pub fn install(profile: Option<ResolvedProfile>) {
    let mut guard = slot()
        .write()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    *guard = profile.map(Arc::new);
}

/// The active profile, or `None` when the invocation is running unprofiled.
///
/// Returns an `Arc` clone: this is called once per registered clap arg while
/// the command tree is built, so cloning the maps each time would be
/// needless work on a hot-ish path.
pub fn active() -> Option<Arc<ResolvedProfile>> {
    slot()
        .read()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
        .clone()
}

/// Install a profile from a test. Separate name so the production call site
/// is greppable and a test cannot be mistaken for one.
///
/// Tests that use this must be `#[serial]` — the slot is process-global.
pub fn install_for_tests(profile: Option<ResolvedProfile>) {
    install(profile);
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::profiles::store::{ProfileEntry, PROFILES_FILENAME};
    use serial_test::serial;

    fn args(slice: &[&str]) -> Vec<String> {
        slice.iter().map(|s| s.to_string()).collect()
    }

    // ── extract_profile_flag ────────────────────────────────────────────

    #[test]
    fn extracts_every_spelling_clap_accepts() {
        for spelling in [
            &["cli", "--profile", "prod", "users", "list"][..],
            &["cli", "--profile=prod", "users", "list"][..],
            &["cli", "-p", "prod", "users", "list"][..],
            &["cli", "-p=prod", "users", "list"][..],
            &["cli", "-pprod", "users", "list"][..],
            &["cli", "users", "list", "-p", "prod"][..],
        ] {
            assert_eq!(
                extract_profile_flag(&args(spelling)).as_deref(),
                Some("prod"),
                "failed for {spelling:?}",
            );
        }
    }

    #[test]
    fn absent_flag_yields_none() {
        assert_eq!(extract_profile_flag(&args(&["cli", "users", "list"])), None);
        // A dangling flag with no value is not a selection.
        assert_eq!(extract_profile_flag(&args(&["cli", "--profile"])), None);
        assert_eq!(extract_profile_flag(&args(&["cli", "--profile", ""])), None);
    }

    #[test]
    fn stops_at_the_double_dash_terminator() {
        assert_eq!(
            extract_profile_flag(&args(&["cli", "run", "--", "-p", "prod"])),
            None,
        );
    }

    #[test]
    fn does_not_confuse_a_longer_short_cluster_for_a_value() {
        // `-p-x` is not `--profile -x`.
        assert_eq!(extract_profile_flag(&args(&["cli", "-p-x"])), None);
    }

    // ── resolve_selection ───────────────────────────────────────────────

    fn store_with(entries: &[&str], active: Option<&str>) -> ProfileStore {
        let dir = tempfile::tempdir().unwrap();
        let mut store = ProfileStore::at_path(dir.path().join(PROFILES_FILENAME));
        for name in entries {
            store.upsert(&ProfileEntry {
                name: (*name).to_string(),
                ..Default::default()
            });
        }
        if let Some(name) = active {
            store.set_active(name);
        }
        std::mem::forget(dir);
        store
    }

    /// Run `f` with `<CLI>_PROFILE` set to `value`, restoring it after.
    fn with_env_profile<R>(cli: &str, value: Option<&str>, f: impl FnOnce() -> R) -> R {
        let key = profile_env_var(cli);
        let previous = std::env::var(&key).ok();
        match value {
            Some(v) => std::env::set_var(&key, v),
            None => std::env::remove_var(&key),
        }
        let result = f();
        match previous {
            Some(v) => std::env::set_var(&key, v),
            None => std::env::remove_var(&key),
        }
        result
    }

    #[test]
    #[serial]
    fn flag_beats_env_beats_active() {
        let store = store_with(&["flagged", "envd", "actived"], Some("actived"));
        with_env_profile("cli", Some("envd"), || {
            // Flag wins over both.
            let selected =
                resolve_selection_in(&store, "cli", &args(&["cli", "-p", "flagged"]))
                    .unwrap()
                    .unwrap();
            assert_eq!(selected.profile.name, "flagged");
            assert_eq!(selected.source, SelectionSource::Flag);

            // Env wins over active.
            let selected = resolve_selection_in(&store, "cli", &args(&["cli"]))
                .unwrap()
                .unwrap();
            assert_eq!(selected.profile.name, "envd");
            assert_eq!(selected.source, SelectionSource::Env);
        });

        // Active is the last rung.
        with_env_profile("cli", None, || {
            let selected = resolve_selection_in(&store, "cli", &args(&["cli"]))
                .unwrap()
                .unwrap();
            assert_eq!(selected.profile.name, "actived");
            assert_eq!(selected.source, SelectionSource::Active);
        });
    }

    #[test]
    #[serial]
    fn no_profile_configured_is_not_an_error() {
        // The compatibility guarantee: every existing generated CLI is here.
        let store = store_with(&[], None);
        with_env_profile("cli", None, || {
            assert!(resolve_selection_in(&store, "cli", &args(&["cli"]))
                .unwrap()
                .is_none());
        });
    }

    #[test]
    #[serial]
    fn named_but_missing_profile_errors_and_lists_the_known_ones() {
        // Never a silent fallthrough to env credentials — the request would
        // hit a tenant the caller did not choose.
        let store = store_with(&["prod", "staging"], None);
        with_env_profile("cli", None, || {
            let err = resolve_selection_in(&store, "cli", &args(&["cli", "-p", "nope"]))
                .unwrap_err()
                .to_string();
            assert!(err.contains("unknown profile `nope`"), "{err}");
            assert!(err.contains("prod, staging"), "{err}");
        });
    }

    #[test]
    #[serial]
    fn missing_profile_from_env_says_so() {
        let store = store_with(&["prod"], None);
        with_env_profile("cli", Some("ghost"), || {
            let err = resolve_selection_in(&store, "cli", &args(&["cli"]))
                .unwrap_err()
                .to_string();
            assert!(err.contains("CLI_PROFILE"), "{err}");
        });
    }

    #[test]
    #[serial]
    fn missing_active_profile_points_at_profiles_use() {
        let store = store_with(&["prod"], Some("prod"));
        // Simulate a hand-edited file whose `active` names a gone profile by
        // removing it without going through `remove`, which clears `active`.
        let mut store = store;
        store.set_active("ghost");
        with_env_profile("cli", None, || {
            let err = resolve_selection_in(&store, "cli", &args(&["cli"]))
                .unwrap_err()
                .to_string();
            assert!(err.contains("profiles use"), "{err}");
        });
    }

    // ── process-global slot ─────────────────────────────────────────────

    #[test]
    #[serial]
    fn install_and_read_back() {
        install(None);
        assert!(active().is_none());

        install(Some(ResolvedProfile {
            name: "prod".to_string(),
            credential: Some("prod".to_string()),
            ..Default::default()
        }));
        assert_eq!(active().unwrap().name, "prod");

        // Swappable, so one test cannot leak into the next.
        install(None);
        assert!(active().is_none());
    }
}
