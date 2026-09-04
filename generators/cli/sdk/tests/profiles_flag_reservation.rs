//! `--profile` must not collide with a spec- or auth-owned flag of the same
//! name.
//!
//! Enabling profiles adds a `.global(true)` arg with the clap id `profile`.
//! Clap rejects duplicate ids for the *whole* command tree, so a spec that
//! happens to name a parameter or a server variable `profile` — or an auth
//! source bound to `AuthCredentialSource::cli("profile")` — used to panic
//! **every** invocation of the binary, not just the profile subcommands.
//!
//! Each case below panicked before the reservation in
//! `profiles::selection::collides_with_profile_flag` was wired into
//! `openapi::commands::flag_name_is_reserved`, `param_clap_arg_id`, and
//! `graft_merged_subtree`'s root-owned id set.
//!
//! Its own file because the reservation is a process-global set by
//! `CliApp::profiles(...)`, and each `tests/*.rs` compiles to its own binary
//! — so "profiles are enabled for this whole process" is a property of the
//! file rather than something each test has to arrange. The conditional half
//! (profiles *off* → no reservation, no renaming) is a unit test in
//! `openapi::commands`, where the marker can be reset under `#[serial]`.
//!
//! Template-author-only: `tests/**` is excluded from generated output via
//! `.sdk-ignore.json`.

use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::auth::AuthCredentialSource;
use fern_cli_sdk::openapi::OpenApiBinding;
use fern_cli_sdk::profiles::ProfilesConfig;
use serial_test::serial;

/// An operation with a query parameter literally named `profile`.
const SPEC_WITH_PARAM: &str = r#"
openapi: 3.0.0
info: { title: Probe, version: "1.0" }
servers: [{ url: "https://api.example.com" }]
paths:
  /things:
    get:
      operationId: things_list
      tags: [things]
      parameters:
        - name: profile
          in: query
          schema: { type: string }
      responses: { "200": { description: ok } }
"#;

/// A templated server URL whose variable is named `profile`, which registers
/// a root-level `.global(true)` flag of that name.
const SPEC_WITH_SERVER_VAR: &str = r#"
openapi: 3.0.0
info: { title: Probe, version: "1.0" }
servers:
  - url: "https://{profile}.api.example.com"
    variables:
      profile: { default: us1 }
paths:
  /things:
    get:
      operationId: things_list
      tags: [things]
      responses: { "200": { description: ok } }
"#;

fn run(app: CliApp, args: &[&str]) -> (i32, String) {
    let mut out: Vec<u8> = Vec::new();
    let code = app.try_run_from_with_output(args, &mut out);
    (code, String::from_utf8_lossy(&out).into_owned())
}

/// Run `f` with `$HOME` pointed at a fresh directory, so nothing touches the
/// developer's real config dir.
fn with_temp_home<R>(f: impl FnOnce() -> R) -> R {
    let home = tempfile::tempdir().expect("tempdir");
    let previous = std::env::var_os("HOME");
    let previous_userprofile = std::env::var_os("USERPROFILE");
    std::env::set_var("HOME", home.path());
    std::env::set_var("USERPROFILE", home.path());
    let result = f();
    match previous {
        Some(v) => std::env::set_var("HOME", v),
        None => std::env::remove_var("HOME"),
    }
    match previous_userprofile {
        Some(v) => std::env::set_var("USERPROFILE", v),
        None => std::env::remove_var("USERPROFILE"),
    }
    result
}

#[test]
#[serial]
fn a_spec_parameter_named_profile_is_renamed_not_a_panic() {
    with_temp_home(|| {
        let (code, output) = run(
            CliApp::new("probe")
                .profiles(ProfilesConfig::new())
                .binding(OpenApiBinding::new().spec(SPEC_WITH_PARAM)),
            &["probe", "things", "list", "--help"],
        );
        assert_eq!(code, 0, "{output}");
        // Same convention `format` / `json` / `output` already use: the flag
        // moves aside and `--help` discloses the wire name it maps to.
        assert!(output.contains("--profile-param"), "{output}");
        assert!(output.contains("(api: profile)"), "{output}");
    });
}

#[test]
#[serial]
fn the_global_profile_flag_still_works_on_that_operation() {
    // The half that a plain "does it panic" check would miss. Leaving the
    // parameter's clap *id* un-mangled did not panic — clap silently skips
    // propagating a global into a subcommand that already owns the id — so
    // `--profile` meant the query parameter on this one command and the
    // global everywhere else, and `-p` was rejected outright.
    with_temp_home(|| {
        let (code, output) = run(
            CliApp::new("probe")
                .profiles(ProfilesConfig::new())
                .binding(OpenApiBinding::new().spec(SPEC_WITH_PARAM)),
            &["probe", "things", "list", "--dry-run", "--format", "json", "-p", "ghost"],
        );
        // Reaching profile *resolution* is the proof the flag was parsed as
        // the global; an unknown name is the expected outcome here.
        assert_ne!(code, 0, "{output}");
        assert!(output.contains("unknown profile `ghost`"), "{output}");
    });
}

#[test]
#[serial]
fn a_server_variable_named_profile_is_skipped_not_a_panic() {
    with_temp_home(|| {
        let (code, output) = run(
            CliApp::new("probe")
                .profiles(ProfilesConfig::new())
                .binding(OpenApiBinding::new().spec(SPEC_WITH_SERVER_VAR)),
            &["probe", "--help"],
        );
        assert_eq!(code, 0, "{output}");
        assert!(output.contains("profiles"), "{output}");
    });
}

#[test]
#[serial]
fn a_skipped_server_variable_still_resolves_to_its_spec_default() {
    // Skipping the *flag* must not leave `{profile}` unsubstituted in the
    // URL — the variable's declared `default` still has to apply, or the
    // request goes out with a literal brace in the host.
    with_temp_home(|| {
        let (code, output) = run(
            CliApp::new("probe")
                .profiles(ProfilesConfig::new())
                .binding(OpenApiBinding::new().spec(SPEC_WITH_SERVER_VAR)),
            &["probe", "things", "list", "--dry-run", "--format", "json"],
        );
        assert_eq!(code, 0, "{output}");
        assert!(output.contains("https://us1.api.example.com"), "{output}");
        // Scoped to the URL: the JSON envelope has braces of its own.
        assert!(
            !output.contains("{profile}"),
            "unsubstituted template in the URL: {output}",
        );
    });
}

#[test]
#[serial]
fn an_auth_source_bound_to_the_profile_flag_is_rejected_not_confused() {
    // The sharpest failure this whole file guards. `AuthCredentialSource::Cli`
    // resolves *by clap id*, and the merge drops a binding arg whose id the
    // root already owns — so the credential silently became whatever the
    // user passed to `--profile`. `Authorization: tenant-acme`.
    //
    // Rejected at startup instead, so it cannot ship.
    with_temp_home(|| {
        let (code, output) = run(
            CliApp::new("probe")
                .profiles(ProfilesConfig::new())
                .binding(
                    OpenApiBinding::new()
                        .spec(SPEC_WITH_PARAM)
                        .auth_scheme("Bearer", AuthCredentialSource::cli("profile")),
                ),
            &["probe", "things", "list", "--dry-run", "-p", "tenant-acme"],
        );
        assert_ne!(code, 0, "{output}");
        assert!(output.contains("--profile"), "{output}");
        assert!(
            output.contains("collide"),
            "expected a collision error, got: {output}",
        );
        // And the profile name must not have been treated as a credential.
        assert!(!output.contains("Authorization"), "{output}");
    });
}

#[test]
#[serial]
fn the_same_rejection_covers_the_pre_existing_reserved_names() {
    // Not a profiles-specific bug: `cli("format")` read the user's
    // `--format json` and sent `json` as the credential, and has since the
    // root globals were introduced. One check covers the whole class.
    with_temp_home(|| {
        for reserved in ["format", "base-url", "schema"] {
            let (code, output) = run(
                CliApp::new("probe").binding(
                    OpenApiBinding::new()
                        .spec(SPEC_WITH_PARAM)
                        .auth_scheme("Bearer", AuthCredentialSource::cli(reserved)),
                ),
                &["probe", "things", "list", "--dry-run"],
            );
            assert_ne!(code, 0, "`{reserved}` should be rejected: {output}");
            assert!(output.contains("collide"), "{output}");
        }
    });
}

#[test]
#[serial]
fn an_ordinary_auth_flag_name_is_untouched() {
    // The check has to be inert for what the generator actually emits —
    // `--api-key` for a single header scheme, kebabed scheme names for
    // several.
    with_temp_home(|| {
        for ok_name in ["api-key", "x-api-key", "token", "profile-key"] {
            let (code, output) = run(
                CliApp::new("probe")
                    .profiles(ProfilesConfig::new())
                    .binding(
                        OpenApiBinding::new()
                            .spec(SPEC_WITH_PARAM)
                            .auth_scheme("Bearer", AuthCredentialSource::cli(ok_name)),
                    ),
                &["probe", "--help"],
            );
            assert_eq!(code, 0, "`{ok_name}` should be accepted: {output}");
            assert!(output.contains(&format!("--{ok_name}")), "{output}");
        }
    });
}
