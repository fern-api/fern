//! `profiles set <name> KEY=VALUE` — addressing profile state by the name the
//! user already knows.
//!
//! Its own file because the interesting case needs **several schemes sharing
//! one env var**, which is the shape a vendor spec plus a layered auth block
//! produces (Twilio declares `TWILIO_ACCOUNT_SID` on three basic schemes).
//! One `set` has to reach all of them, or the user logs in "successfully" and
//! two thirds of the API stays unauthenticated with no indication why.
//!
//! Template-author-only: `tests/**` is excluded from generated output via
//! `.sdk-ignore.json`.

use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::auth::BasicAuth;
use fern_cli_sdk::openapi::OpenApiBinding;
use fern_cli_sdk::profiles::ProfilesConfig;
use serial_test::serial;

const SPEC: &str = r#"
openapi: 3.0.0
info: { title: Multi, version: "1.0" }
servers:
  - url: "https://api.{region}.example.com"
    variables:
      region: { default: us1, enum: [us1, au1] }
paths:
  /things:
    get:
      operationId: things_list
      tags: [things]
      security: [{ schemeA: [] }]
      responses: { "200": { description: ok } }
security: [{ schemeA: [] }]
components:
  securitySchemes:
    schemeA: { type: http, scheme: basic }
    schemeB: { type: http, scheme: basic }
    schemeC: { type: http, scheme: basic }
"#;

/// Three basic schemes, all reading the *same* pair of env vars — the Twilio
/// shape.
fn app() -> CliApp {
    let mut app = CliApp::new("multi").profiles(ProfilesConfig::new());
    for scheme in ["schemeA", "schemeB", "schemeC"] {
        app = app.auth(
            BasicAuth::new(scheme)
                .username_env("MULTI_ACCOUNT_SID")
                .password_env("MULTI_AUTH_TOKEN"),
        );
    }
    app.binding(OpenApiBinding::new().spec(SPEC))
}

fn run(args: &[&str]) -> (i32, String) {
    let mut out: Vec<u8> = Vec::new();
    let code = app().try_run_from_with_output(args, &mut out);
    (code, String::from_utf8_lossy(&out).into_owned())
}

fn with_clean_env<R>(f: impl FnOnce() -> R) -> R {
    let home = tempfile::tempdir().expect("tempdir");
    // `active_store` caches its root at first use, so the store has to be
    // re-installed per test or one test's credential is visible to the next.
    fern_cli_sdk::auth::set_active_store(std::sync::Arc::new(
        fern_cli_sdk::auth::FileKeyringStore::at_root(home.path().to_path_buf()),
    ));
    let previous = std::env::var_os("HOME");
    std::env::set_var("HOME", home.path());
    std::env::set_var("USERPROFILE", home.path());
    std::env::remove_var("MULTI_ACCOUNT_SID");
    std::env::remove_var("MULTI_AUTH_TOKEN");
    let result = f();
    match previous {
        Some(v) => std::env::set_var("HOME", v),
        None => std::env::remove_var("HOME"),
    }
    result
}

fn logged_in(profile: &str) -> Vec<bool> {
    let (_, out) = run(&["multi", "-p", profile, "auth", "status", "--format", "json"]);
    let parsed: serde_json::Value = serde_json::from_str(&out).expect("json");
    parsed["schemes"]
        .as_array()
        .expect("schemes")
        .iter()
        .map(|s| s["logged_in"] == serde_json::Value::Bool(true))
        .collect()
}

#[test]
#[serial]
fn one_assignment_reaches_every_scheme_that_reads_the_variable() {
    // The reason this command exists. Three schemes declare the same env var,
    // so `auth login --scheme …` had to be run three times with names the user
    // cannot guess. One `set` covers all of them.
    with_clean_env(|| {
        let (code, output) = run(&[
            "multi", "profiles", "set", "prod",
            "MULTI_ACCOUNT_SID=AC1111",
            "MULTI_AUTH_TOKEN=tok1",
        ]);
        assert_eq!(code, 0, "{output}");
        assert_eq!(
            logged_in("prod"),
            vec![true, true, true],
            "all three schemes should be satisfied: {output}",
        );
    });
}

#[test]
#[serial]
fn two_profiles_get_independent_credentials() {
    with_clean_env(|| {
        run(&["multi", "profiles", "set", "prod", "MULTI_ACCOUNT_SID=AC1111", "MULTI_AUTH_TOKEN=t1"]);
        run(&["multi", "profiles", "set", "acme", "MULTI_ACCOUNT_SID=AC9999", "MULTI_AUTH_TOKEN=t2"]);
        assert_eq!(logged_in("prod"), vec![true, true, true]);
        assert_eq!(logged_in("acme"), vec![true, true, true]);

        // And the listing shows different accounts, not the slot names.
        let (code, listed) = run(&["multi", "profiles", "list", "--format", "json"]);
        assert_eq!(code, 0, "{listed}");
        let rows: serde_json::Value = serde_json::from_str(&listed).expect("json");
        let rows = rows.as_array().expect("array");
        let account = |name: &str| {
            rows.iter()
                .find(|r| r["profile"] == name)
                .and_then(|r| r["account"].as_str().map(str::to_string))
        };
        assert_eq!(account("prod").as_deref(), Some("AC1111"));
        assert_eq!(account("acme").as_deref(), Some("AC9999"));
    });
}

#[test]
#[serial]
fn setting_one_half_later_does_not_discard_the_other() {
    // A two-field credential written in two calls has to merge. Overwriting
    // would leave half a credential, which satisfies nothing and reports
    // `logged_in: false` with no obvious cause.
    with_clean_env(|| {
        run(&["multi", "profiles", "set", "prod", "MULTI_ACCOUNT_SID=AC1111"]);
        assert_eq!(logged_in("prod"), vec![false, false, false], "half is not enough");
        run(&["multi", "profiles", "set", "prod", "MULTI_AUTH_TOKEN=tok1"]);
        assert_eq!(logged_in("prod"), vec![true, true, true], "the halves should merge");
    });
}

#[test]
#[serial]
fn a_server_variable_is_settable_by_its_env_var_name() {
    with_clean_env(|| {
        let (code, output) = run(&["multi", "profiles", "set", "au", "MULTI_REGION=au1"]);
        assert_eq!(code, 0, "{output}");
        let (code, listed) = run(&["multi", "profiles", "list", "--format", "json"]);
        assert_eq!(code, 0, "{listed}");
        assert!(listed.contains("\"region\": \"au1\""), "{listed}");
    });
}

#[test]
#[serial]
fn an_unknown_key_is_rejected_with_a_suggestion() {
    // The failure `--set` validation exists to prevent: a key that looks right,
    // is stored, and does nothing.
    with_clean_env(|| {
        let (code, output) = run(&["multi", "profiles", "set", "prod", "MULTI_ACCOUNT_SI=AC1"]);
        assert_ne!(code, 0, "{output}");
        assert!(output.contains("MULTI_ACCOUNT_SID"), "should suggest the real name: {output}");
    });
}

#[test]
#[serial]
fn nothing_is_applied_when_a_later_assignment_is_invalid() {
    // Classification happens before any write, so a run that sets two keys and
    // rejects the third must not leave the first two applied.
    with_clean_env(|| {
        let (code, output) = run(&[
            "multi", "profiles", "set", "prod",
            "MULTI_REGION=au1",
            "MULTI_NONSENSE=x",
        ]);
        assert_ne!(code, 0, "{output}");
        let (_, listed) = run(&["multi", "profiles", "list", "--format", "json"]);
        assert!(!listed.contains("au1"), "the valid half must not have landed: {listed}");
    });
}

#[test]
#[serial]
fn a_malformed_assignment_explains_the_expected_shape() {
    with_clean_env(|| {
        let (code, output) = run(&["multi", "profiles", "set", "prod", "MULTI_REGION"]);
        assert_ne!(code, 0, "{output}");
        assert!(output.contains("KEY=VALUE"), "{output}");
    });
}

#[test]
#[serial]
fn a_partial_env_credential_is_reported_as_partial_not_as_an_override() {
    // `credential_overridden_by_env` with one half of a two-value credential
    // set contradicted `auth status`, which correctly said `logged_in: false`.
    // Both are true — the variable is consulted and does outrank the keyring
    // for that field — but only a *complete* env credential is an override.
    with_clean_env(|| {
        run(&["multi", "profiles", "set", "prod", "MULTI_ACCOUNT_SID=AC1", "MULTI_AUTH_TOKEN=t"]);
        run(&["multi", "profiles", "use", "prod"]);

        std::env::set_var("MULTI_AUTH_TOKEN", "half");
        let (_, partial) = run(&["multi", "profiles", "current", "--format", "json"]);
        std::env::remove_var("MULTI_AUTH_TOKEN");
        let parsed: serde_json::Value = serde_json::from_str(&partial).expect("json");
        assert!(parsed.get("credential_overridden_by_env").is_none(), "{partial}");
        assert!(
            parsed.get("credential_partially_shadowed_by_env").is_some(),
            "a half credential is a partial shadow, not an override: {partial}",
        );

        std::env::set_var("MULTI_ACCOUNT_SID", "AC-env");
        std::env::set_var("MULTI_AUTH_TOKEN", "t-env");
        let (_, full) = run(&["multi", "profiles", "current", "--format", "json"]);
        std::env::remove_var("MULTI_ACCOUNT_SID");
        std::env::remove_var("MULTI_AUTH_TOKEN");
        let parsed: serde_json::Value = serde_json::from_str(&full).expect("json");
        assert!(
            parsed.get("credential_overridden_by_env").is_some(),
            "a complete env credential IS an override: {full}",
        );
    });
}
