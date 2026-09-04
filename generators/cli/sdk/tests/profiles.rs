//! Profiles, driven through the real binary.
//!
//! The behaviour under test spans pre-clap selection, the clap tree's
//! `default_value`s, and `collect_params_from_flags` — three layers with no
//! single unit seam between them. So these go through the compiled fixture,
//! the way the `help_catalog` tests do.
//!
//! Every case gets its own `HOME`, because `profiles.toml` lives under the
//! platform config directory (which `oauth_common::config_dir` derives from
//! `$HOME`). That keeps the suite parallel-safe *and* keeps it from writing
//! into the developer's real config directory.
//!
//! Template-author-only: `tests/**` is excluded from generated output via
//! `.sdk-ignore.json`.

use std::path::{Path, PathBuf};
use std::process::{Command, Output};

/// A throwaway `HOME` for one test.
struct Sandbox {
    home: tempfile::TempDir,
}

impl Sandbox {
    fn new() -> Self {
        Self {
            home: tempfile::tempdir().expect("tempdir"),
        }
    }

    fn run(&self, args: &[&str]) -> Output {
        self.run_with_env(args, &[])
    }

    fn run_with_env(&self, args: &[&str], env: &[(&str, &str)]) -> Output {
        let mut command = Command::new(env!("CARGO_BIN_EXE_openapi-fixture"));
        command
            .args(args)
            .env("HOME", self.home.path())
            // Windows resolves the config dir from %USERPROFILE% when $HOME
            // is unset; setting both keeps the sandbox honest on either.
            .env("USERPROFILE", self.home.path())
            // The fixture's own env-var rungs must be quiet unless a test
            // opts in, or an exported credential in the developer's shell
            // would shadow what the test is asserting.
            .env_remove("OPENAPI_FIXTURE_API_KEY")
            .env_remove("OPENAPI_FIXTURE_PROFILE")
            .env_remove("OPENAPI_FIXTURE_OUTPUT")
            .env_remove("OPENAPI_FIXTURE_BASE_URL");
        for (key, value) in env {
            command.env(key, value);
        }
        command.output().expect("failed to run the fixture binary")
    }

    /// `profiles.toml`'s path inside this sandbox, whichever platform layout
    /// `config_dir()` picked.
    fn profiles_path(&self) -> PathBuf {
        let home = self.home.path();
        for candidate in [
            home.join("Library/Application Support/openapi-fixture/profiles.toml"),
            home.join(".config/openapi-fixture/profiles.toml"),
            home.join("AppData/Roaming/openapi-fixture/profiles.toml"),
        ] {
            if candidate.exists() {
                return candidate;
            }
        }
        panic!("profiles.toml was not written anywhere under {}", home.display());
    }
}

fn stdout(output: &Output) -> String {
    String::from_utf8_lossy(&output.stdout).into_owned()
}

fn stderr(output: &Output) -> String {
    String::from_utf8_lossy(&output.stderr).into_owned()
}

fn json(output: &Output) -> serde_json::Value {
    serde_json::from_str(&stdout(output)).unwrap_or_else(|e| {
        panic!(
            "expected JSON on stdout ({e}).\nstdout: {}\nstderr: {}",
            stdout(output),
            stderr(output),
        )
    })
}

/// The outgoing query parameters of a `--dry-run` request, as a sorted
/// `name=value` list — the assertion surface for "did the profile land?".
fn dry_run_query(output: &Output) -> Vec<String> {
    let parsed = json(output);
    let mut pairs: Vec<String> = parsed["query_params"]
        .as_array()
        .unwrap_or_else(|| panic!("no query_params in {parsed:#}"))
        .iter()
        .map(|pair| {
            format!(
                "{}={}",
                pair[0].as_str().unwrap_or_default(),
                pair[1].as_str().unwrap_or_default(),
            )
        })
        .collect();
    pairs.sort();
    pairs
}

fn assert_ok(output: &Output, what: &str) {
    assert_eq!(
        output.status.code(),
        Some(0),
        "{what} failed.\nstdout: {}\nstderr: {}",
        stdout(output),
        stderr(output),
    );
}

// ── The compatibility guarantee ─────────────────────────────────────────

#[test]
fn with_no_profile_configured_nothing_changes() {
    // The single most important case: every existing generated CLI is here,
    // and it must behave exactly as it did before profiles existed —
    // `x-fern-default` applies, no profile is selected, nothing errors.
    let sandbox = Sandbox::new();

    let output = sandbox.run(&["users", "list", "--dry-run", "--format", "json"]);
    assert_ok(&output, "users list with no profile");
    assert_eq!(dry_run_query(&output), vec!["user_type=all".to_string()]);

    let current = sandbox.run(&["profiles", "current", "--format", "json"]);
    assert_ok(&current, "profiles current");
    assert_eq!(json(&current)["profile"], serde_json::Value::Null);
    assert_eq!(json(&current)["source"], "none");

    // And no file is created just by running commands.
    assert!(
        !sandbox
            .home
            .path()
            .join("Library/Application Support/openapi-fixture/profiles.toml")
            .exists()
            && !sandbox
                .home
                .path()
                .join(".config/openapi-fixture/profiles.toml")
                .exists(),
        "reading profiles must not write profiles.toml",
    );
}

#[test]
fn auth_status_still_works_and_reports_no_profile() {
    let sandbox = Sandbox::new();
    let output = sandbox.run(&["auth", "status", "--format", "json"]);
    assert_ok(&output, "auth status");
    assert_eq!(json(&output)["profile"], serde_json::Value::Null);
}

// ── create / list / use / current / remove ──────────────────────────────

#[test]
fn create_then_use_then_the_parameter_default_lands() {
    // The headline behaviour: after `profiles use`, the parameter stops
    // being typed.
    let sandbox = Sandbox::new();
    assert_ok(
        &sandbox.run(&["profiles", "create", "prod", "--set", "searchQuery=alice"]),
        "profiles create",
    );
    assert_ok(&sandbox.run(&["profiles", "use", "prod"]), "profiles use");

    let output = sandbox.run(&["users", "list", "--dry-run", "--format", "json"]);
    assert_ok(&output, "users list under the active profile");
    assert_eq!(
        dry_run_query(&output),
        vec!["filter_term=alice".to_string(), "user_type=all".to_string()],
    );
}

#[test]
fn create_use_flag_activates_in_one_step() {
    let sandbox = Sandbox::new();
    assert_ok(
        &sandbox.run(&["profiles", "create", "prod", "--set", "searchQuery=alice", "--use"]),
        "profiles create --use",
    );
    let current = sandbox.run(&["profiles", "current", "--format", "json"]);
    assert_eq!(json(&current)["profile"], "prod");
    assert_eq!(json(&current)["source"], "active profile");
}

#[test]
fn list_json_reports_the_resolved_view_and_marks_the_active_profile() {
    let sandbox = Sandbox::new();
    sandbox.run(&["profiles", "create", "prod", "--set", "searchQuery=alice"]);
    sandbox.run(&["profiles", "create", "acme", "--parent", "prod", "--set", "searchQuery=bob"]);
    assert_ok(&sandbox.run(&["profiles", "use", "acme"]), "profiles use");

    let output = sandbox.run(&["profiles", "list", "--format", "json"]);
    assert_ok(&output, "profiles list");
    let rows = json(&output);
    let rows = rows.as_array().expect("list emits an array");
    assert_eq!(rows.len(), 2, "{rows:#?}");

    let acme = rows
        .iter()
        .find(|row| row["profile"] == "acme")
        .expect("acme row");
    assert_eq!(acme["active"], "*");
    assert_eq!(acme["parent"], "prod");
    // Resolved, not literal: the credential is inherited from the parent.
    assert_eq!(acme["credential"], "prod");
    assert_eq!(acme["parameters"]["searchQuery"], "bob");

    let prod = rows
        .iter()
        .find(|row| row["profile"] == "prod")
        .expect("prod row");
    assert_eq!(prod["active"], "");
}

#[test]
fn use_dash_clears_the_active_profile() {
    let sandbox = Sandbox::new();
    sandbox.run(&["profiles", "create", "prod", "--set", "searchQuery=alice", "--use"]);
    assert_ok(&sandbox.run(&["profiles", "use", "-"]), "profiles use -");

    let output = sandbox.run(&["users", "list", "--dry-run", "--format", "json"]);
    assert_eq!(dry_run_query(&output), vec!["user_type=all".to_string()]);
}

#[test]
fn remove_refuses_without_confirmation_when_stdin_is_not_a_tty() {
    // Prompting under a script or an agent would hang forever (the M17
    // contract), so the command must fail loudly instead.
    let sandbox = Sandbox::new();
    sandbox.run(&["profiles", "create", "prod", "--use"]);

    let output = sandbox.run(&["profiles", "remove", "prod"]);
    assert_ne!(output.status.code(), Some(0), "{}", stdout(&output));
    assert!(stdout(&output).contains("--yes"), "{}", stdout(&output));

    // Still there.
    assert_eq!(
        json(&sandbox.run(&["profiles", "list", "--format", "json"]))
            .as_array()
            .map(Vec::len),
        Some(1),
    );
}

#[test]
fn remove_with_yes_deletes_the_profile_and_clears_active() {
    let sandbox = Sandbox::new();
    sandbox.run(&["profiles", "create", "prod", "--set", "searchQuery=alice", "--use"]);
    assert_ok(
        &sandbox.run(&["profiles", "remove", "prod", "--yes"]),
        "profiles remove --yes",
    );

    let listed = sandbox.run(&["profiles", "list", "--format", "json"]);
    assert_eq!(json(&listed).as_array().map(Vec::len), Some(0));
    // The active pointer went with it, so ordinary commands still work.
    let output = sandbox.run(&["users", "list", "--dry-run", "--format", "json"]);
    assert_ok(&output, "users list after removing the active profile");
}

#[test]
fn remove_refuses_to_orphan_a_child_profile() {
    let sandbox = Sandbox::new();
    sandbox.run(&["profiles", "create", "prod"]);
    sandbox.run(&["profiles", "create", "acme", "--parent", "prod"]);

    let output = sandbox.run(&["profiles", "remove", "prod", "--yes"]);
    assert_ne!(output.status.code(), Some(0));
    assert!(stdout(&output).contains("acme"), "{}", stdout(&output));
}

// ── Precedence ──────────────────────────────────────────────────────────

#[test]
fn explicit_flag_beats_the_profile() {
    let sandbox = Sandbox::new();
    sandbox.run(&["profiles", "create", "prod", "--set", "searchQuery=alice", "--use"]);

    let output = sandbox.run(&[
        "users", "list", "--dry-run", "--format", "json", "--search-query", "zed",
    ]);
    assert_ok(&output, "users list with an explicit flag");
    assert_eq!(
        dry_run_query(&output),
        vec!["filter_term=zed".to_string(), "user_type=all".to_string()],
    );
}

#[test]
fn the_profile_beats_the_spec_default() {
    // `user_type` carries `x-fern-default: all`. The profile has to outrank
    // it, or a profile can never change a parameter the spec defaults.
    let sandbox = Sandbox::new();
    sandbox.run(&["profiles", "create", "prod", "--set", "user_type=managed", "--use"]);

    let output = sandbox.run(&["users", "list", "--dry-run", "--format", "json"]);
    assert_ok(&output, "users list");
    assert_eq!(dry_run_query(&output), vec!["user_type=managed".to_string()]);
}

#[test]
fn a_profile_may_store_an_enum_display_alias() {
    // `--user-type Managed` is accepted by the command (the alias of the
    // wire value `managed`), so a profile must accept it too — and it must
    // reach the wire as the wire value.
    let sandbox = Sandbox::new();
    sandbox.run(&["profiles", "create", "prod", "--set", "user_type=Managed", "--use"]);

    let output = sandbox.run(&["users", "list", "--dry-run", "--format", "json"]);
    assert_ok(&output, "users list");
    assert_eq!(dry_run_query(&output), vec!["user_type=managed".to_string()]);
}

#[test]
fn the_profile_flag_overrides_the_active_profile_for_one_invocation() {
    let sandbox = Sandbox::new();
    sandbox.run(&["profiles", "create", "prod", "--set", "searchQuery=alice"]);
    sandbox.run(&["profiles", "create", "acme", "--set", "searchQuery=bob", "--use"]);

    for flag in [&["-p", "prod"][..], &["--profile", "prod"][..]] {
        let mut args = vec!["users", "list", "--dry-run", "--format", "json"];
        args.extend_from_slice(flag);
        let output = sandbox.run(&args);
        assert_ok(&output, "users list with an explicit profile");
        assert!(
            dry_run_query(&output).contains(&"filter_term=alice".to_string()),
            "{flag:?} did not select `prod`: {:?}",
            dry_run_query(&output),
        );
    }

    // The active profile is unchanged — `-p` is per-invocation.
    assert_eq!(
        json(&sandbox.run(&["profiles", "current", "--format", "json"]))["profile"],
        "acme",
    );
}

#[test]
fn the_profile_env_var_beats_the_active_profile() {
    let sandbox = Sandbox::new();
    sandbox.run(&["profiles", "create", "prod", "--set", "searchQuery=alice"]);
    sandbox.run(&["profiles", "create", "acme", "--set", "searchQuery=bob", "--use"]);

    let output = sandbox.run_with_env(
        &["users", "list", "--dry-run", "--format", "json"],
        &[("OPENAPI_FIXTURE_PROFILE", "prod")],
    );
    assert_ok(&output, "users list under the env-selected profile");
    assert!(dry_run_query(&output).contains(&"filter_term=alice".to_string()));
}

#[test]
fn the_profile_flag_beats_the_profile_env_var() {
    let sandbox = Sandbox::new();
    sandbox.run(&["profiles", "create", "prod", "--set", "searchQuery=alice"]);
    sandbox.run(&["profiles", "create", "acme", "--set", "searchQuery=bob"]);

    let output = sandbox.run_with_env(
        &["users", "list", "--dry-run", "--format", "json", "-p", "acme"],
        &[("OPENAPI_FIXTURE_PROFILE", "prod")],
    );
    assert!(dry_run_query(&output).contains(&"filter_term=bob".to_string()));
}

#[test]
fn base_url_env_var_beats_the_profile() {
    // CI exports the env var; a developer's stored profile must not
    // redirect the pipeline.
    let sandbox = Sandbox::new();
    sandbox.run(&[
        "profiles", "create", "prod", "--base-url", "https://profile.example", "--use",
    ]);

    let from_profile = sandbox.run(&["users", "list", "--dry-run", "--format", "json"]);
    assert_eq!(
        json(&from_profile)["url"],
        "https://profile.example/users",
        "the profile should supply the base URL when nothing else does",
    );

    let from_env = sandbox.run_with_env(
        &["users", "list", "--dry-run", "--format", "json"],
        &[("OPENAPI_FIXTURE_BASE_URL", "https://env.example")],
    );
    assert_eq!(json(&from_env)["url"], "https://env.example/users");

    // And the flag beats both.
    let from_flag = sandbox.run_with_env(
        &[
            "users", "list", "--dry-run", "--format", "json",
            "--base-url", "https://flag.example",
        ],
        &[("OPENAPI_FIXTURE_BASE_URL", "https://env.example")],
    );
    assert_eq!(json(&from_flag)["url"], "https://flag.example/users");
}

// ── Inheritance ─────────────────────────────────────────────────────────

#[test]
fn a_child_inherits_the_parents_parameters_and_overrides_one() {
    let sandbox = Sandbox::new();
    sandbox.run(&[
        "profiles", "create", "prod",
        "--set", "searchQuery=alice",
        "--set", "user_type=managed",
    ]);
    sandbox.run(&[
        "profiles", "create", "acme", "--parent", "prod", "--set", "searchQuery=bob", "--use",
    ]);

    let output = sandbox.run(&["users", "list", "--dry-run", "--format", "json"]);
    assert_ok(&output, "users list under the child profile");
    assert_eq!(
        dry_run_query(&output),
        // `user_type` inherited, `filter_term` overridden.
        vec!["filter_term=bob".to_string(), "user_type=managed".to_string()],
    );
}

#[test]
fn a_child_does_not_inherit_the_parents_output_format() {
    // Deliberate: inheriting `format` would make a script's output shape
    // depend on a profile it never named.
    let sandbox = Sandbox::new();
    assert_ok(
        &sandbox.run(&["profiles", "create", "prod", "--default-format", "yaml"]),
        "profiles create --default-format",
    );
    sandbox.run(&["profiles", "create", "acme", "--parent", "prod"]);

    let rows = json(&sandbox.run(&["profiles", "list", "--format", "json"]));
    let rows = rows.as_array().unwrap();
    // The parent really does carry it — otherwise the assertion below would
    // pass vacuously.
    let prod = rows.iter().find(|row| row["profile"] == "prod").unwrap();
    assert_eq!(prod["format"], "yaml", "{prod:#}");

    let acme = rows.iter().find(|row| row["profile"] == "acme").unwrap();
    assert!(acme.get("format").is_none(), "{acme:#}");
}

#[test]
fn create_does_not_reinterpret_the_global_format_flag() {
    // `--format` on `profiles create` must keep meaning "render this
    // command's output that way", not "store this as the profile's default"
    // — the profile's default is `--default-format`. A `create` arg sharing
    // the global's clap id would have shadowed it and made the two
    // indistinguishable.
    let sandbox = Sandbox::new();
    assert_ok(
        &sandbox.run(&["profiles", "create", "prod", "--format", "json"]),
        "profiles create --format json",
    );

    let rows = json(&sandbox.run(&["profiles", "list", "--format", "json"]));
    let prod = &rows.as_array().unwrap()[0];
    assert!(prod.get("format").is_none(), "{prod:#}");
}

#[test]
fn an_invalid_default_format_is_rejected_at_create_time() {
    // A stored format nothing can parse would fail every later command with
    // an error pointing at `--format`, a flag the caller never passed.
    let sandbox = Sandbox::new();
    let output = sandbox.run(&["profiles", "create", "prod", "--default-format", "yamlish"]);
    assert_ne!(output.status.code(), Some(0), "{}", stdout(&output));
}

#[test]
fn a_profile_default_format_applies_when_nothing_else_asks() {
    let sandbox = Sandbox::new();
    sandbox.run(&["profiles", "create", "prod", "--default-format", "yaml", "--use"]);

    // No `--format`, and stdout is a pipe (so the TTY default would be json).
    let output = sandbox.run(&["users", "list", "--dry-run"]);
    assert_ok(&output, "users list under a profile default format");
    assert!(
        serde_json::from_str::<serde_json::Value>(&stdout(&output)).is_err(),
        "expected YAML, got JSON: {}",
        stdout(&output),
    );

    // And the env var still outranks it.
    let from_env = sandbox.run_with_env(
        &["users", "list", "--dry-run"],
        &[("OPENAPI_FIXTURE_OUTPUT", "json")],
    );
    assert_ok(&from_env, "users list with OPENAPI_FIXTURE_OUTPUT=json");
    assert!(
        serde_json::from_str::<serde_json::Value>(&stdout(&from_env)).is_ok(),
        "the env var must outrank the profile: {}",
        stdout(&from_env),
    );
}

#[test]
fn a_parent_that_does_not_exist_is_rejected_at_create_time() {
    // Rejected before the write, so a broken chain is never persisted.
    let sandbox = Sandbox::new();
    let output = sandbox.run(&["profiles", "create", "acme", "--parent", "ghost"]);
    assert_ne!(output.status.code(), Some(0));
    assert!(stdout(&output).contains("ghost"), "{}", stdout(&output));
    assert_eq!(
        json(&sandbox.run(&["profiles", "list", "--format", "json"]))
            .as_array()
            .map(Vec::len),
        Some(0),
        "the rejected profile must not have been written",
    );
}

// ── Errors ──────────────────────────────────────────────────────────────

#[test]
fn a_named_but_missing_profile_errors_and_never_falls_back_silently() {
    // The sharpest failure this feature could have: `-p nope` sending the
    // request with the caller's default credentials against a tenant they
    // did not choose.
    let sandbox = Sandbox::new();
    sandbox.run(&["profiles", "create", "prod"]);

    let output = sandbox.run(&["users", "list", "--dry-run", "--format", "json", "-p", "nope"]);
    assert_ne!(output.status.code(), Some(0), "{}", stdout(&output));
    let message = json(&output)["error"]["message"]
        .as_str()
        .unwrap_or_default()
        .to_string();
    assert!(message.contains("unknown profile `nope`"), "{message}");
    assert!(message.contains("prod"), "known profiles must be listed: {message}");
}

#[test]
fn an_unknown_parameter_name_is_rejected_rather_than_silently_stored() {
    let sandbox = Sandbox::new();
    let output = sandbox.run(&["profiles", "create", "prod", "--set", "AcountSid=AC11"]);
    assert_ne!(output.status.code(), Some(0));
    assert!(
        stdout(&output).contains("no operation accepts"),
        "{}",
        stdout(&output),
    );
}

#[test]
fn a_value_outside_the_parameters_enum_is_rejected_at_create_time() {
    // Otherwise the profile installs `admin` as `--user-type`'s default and
    // every command carrying that parameter fails on a flag never passed.
    let sandbox = Sandbox::new();
    let output = sandbox.run(&["profiles", "create", "prod", "--set", "user_type=admin"]);
    assert_ne!(output.status.code(), Some(0));
    assert!(
        stdout(&output).contains("not an accepted value"),
        "{}",
        stdout(&output),
    );
}

#[test]
fn creating_a_profile_that_exists_needs_force() {
    let sandbox = Sandbox::new();
    assert_ok(&sandbox.run(&["profiles", "create", "prod"]), "first create");

    let output = sandbox.run(&["profiles", "create", "prod"]);
    assert_ne!(output.status.code(), Some(0));
    assert!(stdout(&output).contains("--force"), "{}", stdout(&output));

    assert_ok(
        &sandbox.run(&["profiles", "create", "prod", "--force", "--set", "searchQuery=alice"]),
        "create --force",
    );
}

#[test]
fn force_preserves_fields_the_rerun_did_not_mention() {
    // A re-run that only passes `--set` must not wipe the profile's base URL.
    let sandbox = Sandbox::new();
    sandbox.run(&[
        "profiles", "create", "prod", "--base-url", "https://profile.example",
    ]);
    sandbox.run(&[
        "profiles", "create", "prod", "--force", "--set", "searchQuery=alice",
    ]);

    let rows = json(&sandbox.run(&["profiles", "list", "--format", "json"]));
    let prod = &rows.as_array().unwrap()[0];
    assert_eq!(prod["base_url"], "https://profile.example");
    assert_eq!(prod["parameters"]["searchQuery"], "alice");
}

#[test]
fn a_broken_active_profile_leaves_the_profiles_group_usable() {
    // The repair path must not require the thing that is broken. Hand-edit
    // `active` to name a profile that does not exist, the way a bad merge
    // would.
    let sandbox = Sandbox::new();
    sandbox.run(&["profiles", "create", "prod", "--use"]);
    let path = sandbox.profiles_path();
    let text = std::fs::read_to_string(&path).unwrap();
    std::fs::write(&path, text.replace("active = \"prod\"", "active = \"ghost\"")).unwrap();

    // A real command errors, and says how to fix it.
    let broken = sandbox.run(&["users", "list", "--dry-run", "--format", "json"]);
    assert_ne!(broken.status.code(), Some(0));
    assert!(
        json(&broken)["error"]["message"]
            .as_str()
            .unwrap_or_default()
            .contains("profiles use"),
        "{}",
        stdout(&broken),
    );

    // But the group that fixes it still works, as do `--help` and `--schema`.
    assert_ok(&sandbox.run(&["profiles", "list", "--format", "json"]), "profiles list");
    assert_ok(&sandbox.run(&["--help"]), "--help");
    assert_ok(&sandbox.run(&["--schema"]), "--schema");
    assert_ok(&sandbox.run(&["profiles", "use", "prod"]), "profiles use prod");
    assert_ok(
        &sandbox.run(&["users", "list", "--dry-run", "--format", "json"]),
        "users list after the repair",
    );
}

#[test]
fn a_malformed_profiles_file_does_not_brick_the_cli() {
    let sandbox = Sandbox::new();
    sandbox.run(&["profiles", "create", "prod", "--use"]);
    std::fs::write(sandbox.profiles_path(), "this is not = = toml [[[").unwrap();

    let output = sandbox.run(&["users", "list", "--dry-run", "--format", "json"]);
    assert_ok(&output, "users list with a corrupt profiles.toml");
    assert_eq!(dry_run_query(&output), vec!["user_type=all".to_string()]);
}

// ── Storage shape ───────────────────────────────────────────────────────

#[test]
fn secrets_never_reach_profiles_toml() {
    // The load-bearing security property: the file names a keyring account,
    // it does not hold a credential.
    let sandbox = Sandbox::new();
    sandbox.run(&[
        "profiles", "create", "prod",
        "--credential", "prod",
        "--oauth-client-id", "public-client-id",
        "--set", "searchQuery=alice",
    ]);
    let text = std::fs::read_to_string(sandbox.profiles_path()).unwrap();
    assert!(text.contains("credential = \"prod\""), "{text}");
    // The client id is public by construction (RFC 6749 §2.2) and is meant
    // to be here; nothing that looks like a token is.
    assert!(text.contains("oauth_client_id = \"public-client-id\""), "{text}");
    for forbidden in ["token", "secret", "password", "api_key"] {
        assert!(
            !text.to_lowercase().contains(forbidden),
            "`{forbidden}` must not appear in profiles.toml:\n{text}",
        );
    }
}

#[test]
fn round_tripping_preserves_comments_and_unknown_keys() {
    // An older binary editing a file a newer one wrote must not delete the
    // fields — or the user's notes — it does not understand.
    let sandbox = Sandbox::new();
    sandbox.run(&["profiles", "create", "prod"]);
    let path = sandbox.profiles_path();
    let text = std::fs::read_to_string(&path).unwrap();
    std::fs::write(
        &path,
        format!("# hand-written note\n{text}\nfuture_top_level = \"keep\"\n"),
    )
    .unwrap();

    assert_ok(&sandbox.run(&["profiles", "use", "prod"]), "profiles use");

    let after = std::fs::read_to_string(&path).unwrap();
    assert!(after.contains("# hand-written note"), "{after}");
    assert!(after.contains("future_top_level = \"keep\""), "{after}");
    assert!(after.contains("active = \"prod\""), "{after}");
}

// ── Discoverability ─────────────────────────────────────────────────────

#[test]
fn schema_advertises_the_profiles_commands_and_the_profile_flag() {
    // Without this an agent reads `--schema`, concludes the CLI has no way
    // to switch tenant, and has no way to find out otherwise.
    let sandbox = Sandbox::new();
    let output = sandbox.run(&["--schema"]);
    assert_ok(&output, "--schema");
    let parsed = json(&output);

    let builtins: Vec<String> = parsed["builtinCommands"]
        .as_array()
        .unwrap_or_else(|| panic!("no builtinCommands in {parsed:#}"))
        .iter()
        .map(|entry| entry["command"].as_str().unwrap_or_default().to_string())
        .collect();
    for expected in [
        "profiles create",
        "profiles list",
        "profiles use",
        "profiles remove",
        "profiles current",
        "auth login",
        "auth logout",
        "auth status",
        "completion",
        "man",
    ] {
        assert!(builtins.contains(&expected.to_string()), "{builtins:?}");
    }

    let flags: Vec<String> = parsed["globalFlags"]
        .as_array()
        .expect("globalFlags")
        .iter()
        .map(|entry| entry["flag"].as_str().unwrap_or_default().to_string())
        .collect();
    assert!(flags.contains(&"--profile".to_string()), "{flags:?}");

    // The operation catalog is unchanged in shape.
    assert!(!parsed["operations"].as_array().expect("operations").is_empty());
}

#[test]
fn profiles_appears_in_root_help() {
    let sandbox = Sandbox::new();
    let output = sandbox.run(&["--help"]);
    assert_ok(&output, "--help");
    assert!(stdout(&output).contains("profiles"), "{}", stdout(&output));
    assert!(stdout(&output).contains("--profile"), "{}", stdout(&output));
}

#[test]
fn the_profiles_file_lives_beside_the_other_credential_state() {
    // Same directory as `auth-keyring.json` / `credentials.json`, so a user
    // clearing CLI state has one place to look.
    let sandbox = Sandbox::new();
    sandbox.run(&["profiles", "create", "prod"]);
    let path = sandbox.profiles_path();
    assert_eq!(path.file_name().and_then(|n| n.to_str()), Some("profiles.toml"));
    assert_eq!(
        path.parent().and_then(Path::file_name).and_then(|n| n.to_str()),
        Some("openapi-fixture"),
    );
}
