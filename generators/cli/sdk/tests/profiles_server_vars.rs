//! Profiles on a spec that declares `servers[].variables`.
//!
//! Its own file, and driven through `CliApp` rather than the fixture binary,
//! because the fixture's spec declares no server variables — which is exactly
//! why the collision the first test guards was not caught by
//! `tests/profiles.rs`. It only reproduced once a *generated* CLI with a
//! templated server URL was built, at which point every invocation panicked
//! inside clap's tree validation.
//!
//! These go through the real selection path (a `profiles.toml` under a
//! throwaway `$HOME`) rather than `install_for_tests`, because every run
//! resolves and installs the profile itself — a pre-installed one would be
//! overwritten before the first command saw it.
//!
//! Template-author-only: `tests/**` is excluded from generated output via
//! `.sdk-ignore.json`.

use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::openapi::OpenApiBinding;
use fern_cli_sdk::profiles::ProfilesConfig;
use serial_test::serial;

/// `{region}` in the server URL, with a spec-declared `default` — so the
/// generated CLI registers a global `--region` flag carrying `us1`.
const SPEC: &str = r#"
openapi: 3.0.0
info: { title: Regional API, version: "1.0" }
servers:
  - url: https://{region}.api.example.com
    variables:
      region:
        default: us1
        enum: [us1, au1]
paths:
  /messages:
    get:
      operationId: messages_list
      tags: [messages]
      responses:
        "200": { description: ok }
"#;

fn app() -> CliApp {
    CliApp::new("regional")
        .profiles(ProfilesConfig::new())
        .binding(OpenApiBinding::new().spec(SPEC))
}

fn run(args: &[&str]) -> (i32, String) {
    let mut out: Vec<u8> = Vec::new();
    let code = app().try_run_from_with_output(args, &mut out);
    (code, String::from_utf8_lossy(&out).into_owned())
}

/// Run `f` with `$HOME` pointed at a fresh directory, so `profiles.toml`
/// lands somewhere disposable rather than in the developer's config dir.
///
/// `#[serial]` is mandatory on every caller: `$HOME` is process-global, and
/// so is the resolved-profile slot each run installs.
fn with_temp_home<R>(f: impl FnOnce() -> R) -> R {
    let home = tempfile::tempdir().expect("tempdir");
    let previous_home = std::env::var_os("HOME");
    let previous_userprofile = std::env::var_os("USERPROFILE");
    std::env::set_var("HOME", home.path());
    std::env::set_var("USERPROFILE", home.path());

    let result = f();

    match previous_home {
        Some(value) => std::env::set_var("HOME", value),
        None => std::env::remove_var("HOME"),
    }
    match previous_userprofile {
        Some(value) => std::env::set_var("USERPROFILE", value),
        None => std::env::remove_var("USERPROFILE"),
    }
    result
}

/// Create a profile pinning `region` to `region`, and activate it.
fn create_region_profile(region: &str) {
    let (code, output) = run(&[
        "regional", "profiles", "create", "au", "--server-var",
        &format!("region={region}"), "--use",
    ]);
    assert_eq!(code, 0, "profiles create failed: {output}");
}

#[test]
#[serial]
fn the_command_tree_builds_when_the_spec_declares_a_server_variable() {
    // The regression. `profiles create` used to register its own `--region`
    // convenience flag; the spec's variable already registers a `.global(true)`
    // `--region` on the root, and clap propagates a global into a subcommand
    // only when the subcommand has no arg with the same *id*. Two args sharing
    // one long name makes clap reject the whole tree at startup, so every
    // invocation of the binary panicked — `messages list` included, not just
    // `profiles create`.
    with_temp_home(|| {
        let (code, output) = run(&["regional", "--help"]);
        assert_eq!(code, 0, "{output}");
        assert!(output.contains("profiles"), "{output}");

        // The group itself is reachable, and so is an ordinary operation.
        let (code, output) = run(&["regional", "profiles", "create", "--help"]);
        assert_eq!(code, 0, "{output}");
        let (code, output) = run(&["regional", "messages", "list", "--help"]);
        assert_eq!(code, 0, "{output}");
    });
}

#[test]
#[serial]
fn a_server_variables_own_flag_sets_it_on_create() {
    // `profiles create au --region au1` — the spelling a user already knows
    // from ordinary commands, read from the propagated global rather than a
    // `create`-local duplicate.
    with_temp_home(|| {
        let (code, output) =
            run(&["regional", "profiles", "create", "au", "--region", "au1", "--use"]);
        assert_eq!(code, 0, "{output}");

        let (code, output) = run(&["regional", "profiles", "list", "--format", "json"]);
        assert_eq!(code, 0, "{output}");
        assert!(
            output.contains("\"region\": \"au1\""),
            "the profile should have captured region=au1: {output}",
        );
    });
}

#[test]
#[serial]
fn omitting_the_flag_does_not_freeze_the_specs_default_into_the_profile() {
    // The spec's `default: us1` reaches `create` as a clap `DefaultValue`. If
    // that counted, every profile would silently pin `region = "us1"` — and a
    // later spec change to the default would stop reaching those users.
    with_temp_home(|| {
        let (code, output) = run(&["regional", "profiles", "create", "plain", "--use"]);
        assert_eq!(code, 0, "{output}");

        let (code, output) = run(&["regional", "profiles", "list", "--format", "json"]);
        assert_eq!(code, 0, "{output}");
        assert!(
            !output.contains("server_variables"),
            "no server variable should have been stored: {output}",
        );
    });
}

#[test]
#[serial]
fn a_profile_server_variable_reaches_the_url() {
    with_temp_home(|| {
        create_region_profile("au1");
        let (code, output) = run(&[
            "regional", "messages", "list", "--dry-run", "--format", "json",
        ]);
        assert_eq!(code, 0, "{output}");
        assert!(
            output.contains("https://au1.api.example.com"),
            "the profile's region should be substituted: {output}",
        );
    });
}

#[test]
#[serial]
fn the_flag_beats_the_profiles_server_variable() {
    with_temp_home(|| {
        create_region_profile("au1");
        let (code, output) = run(&[
            "regional", "messages", "list", "--dry-run", "--format", "json",
            "--region", "us1",
        ]);
        assert_eq!(code, 0, "{output}");
        assert!(
            output.contains("https://us1.api.example.com"),
            "an explicit --region must win: {output}",
        );
    });
}

#[test]
#[serial]
fn the_profile_beats_the_specs_declared_default() {
    // Otherwise a profile could never change a server variable that declares
    // a default — i.e. most of them.
    with_temp_home(|| {
        create_region_profile("au1");
        let (code, output) = run(&[
            "regional", "messages", "list", "--dry-run", "--format", "json",
        ]);
        assert_eq!(code, 0, "{output}");
        assert!(!output.contains("us1"), "the spec default leaked: {output}");
    });
}

#[test]
#[serial]
fn without_a_profile_the_specs_default_still_applies() {
    with_temp_home(|| {
        let (code, output) = run(&[
            "regional", "messages", "list", "--dry-run", "--format", "json",
        ]);
        assert_eq!(code, 0, "{output}");
        assert!(
            output.contains("https://us1.api.example.com"),
            "the spec default must be unchanged when unprofiled: {output}",
        );
    });
}

#[test]
#[serial]
fn an_unknown_server_variable_is_rejected() {
    with_temp_home(|| {
        let (code, output) = run(&[
            "regional", "profiles", "create", "bad", "--server-var", "regio=au1",
        ]);
        assert_ne!(code, 0, "{output}");
        assert!(output.contains("Did you mean `region`?"), "{output}");
    });
}
