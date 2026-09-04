//! HTTP basic auth (username + password) stored per profile.
//!
//! Basic is the one scheme whose credential is two values, and it used to
//! have no keyring rung at all: `auth login` reported success, wrote an
//! entry, and nothing ever read it — the CLI still said "not logged in".
//! That silently blocked per-profile credentials for every basic-auth API
//! (Twilio's `AccountSid` : `AuthToken` among them).
//!
//! Both halves live in ONE keyring entry as `{"username":…,"password":…}`,
//! each read back through `AuthCredentialSource::KeyringField`. One entry
//! rather than two because the OS keychain prompts per item.
//!
//! Template-author-only: `tests/**` is excluded from generated output.

use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::auth::BasicAuth;
use fern_cli_sdk::openapi::OpenApiBinding;
use fern_cli_sdk::profiles::ProfilesConfig;
use serial_test::serial;

const SPEC: &str = r#"
openapi: 3.0.0
info: { title: Basic, version: "1.0" }
servers: [{ url: "https://api.example.com" }]
paths:
  /Accounts/{AccountSid}/Messages:
    get:
      operationId: messages_list
      tags: [messages]
      security: [{ basic: [] }]
      parameters:
        - { name: AccountSid, in: path, required: true, schema: { type: string } }
      responses: { "200": { description: ok } }
components:
  securitySchemes:
    basic: { type: http, scheme: basic }
"#;

fn app() -> CliApp {
    CliApp::new("bsc")
        .profiles(ProfilesConfig::new())
        .auth(
            BasicAuth::new("basic")
                .username_env("BSC_USERNAME")
                .password_env("BSC_PASSWORD"),
        )
        .binding(OpenApiBinding::new().spec(SPEC))
}

fn run(args: &[&str]) -> (i32, String) {
    let mut out: Vec<u8> = Vec::new();
    let code = app().try_run_from_with_output(args, &mut out);
    (code, String::from_utf8_lossy(&out).into_owned())
}

fn logged_in(profile: Option<&str>) -> bool {
    let mut args = vec!["bsc", "auth", "status", "--format", "json"];
    if let Some(p) = profile {
        args.extend_from_slice(&["-p", p]);
    }
    let parsed: serde_json::Value = serde_json::from_str(&run(&args).1).expect("json");
    parsed["schemes"][0]["logged_in"] == serde_json::Value::Bool(true)
}

/// `$HOME` in a temp dir, a **fresh keyring store**, and the scheme's env
/// vars cleared so only the keyring rung can satisfy the scheme.
/// `#[serial]` is mandatory — all three are process-global.
///
/// Re-installing the store matters: `active_store()` resolves its root once
/// per process and caches it, so moving `$HOME` afterwards does not move the
/// store. Without this, one test's stored credential is visible to the next
/// and "should start logged out" fails depending on test order.
fn with_clean_env<R>(f: impl FnOnce(&std::path::Path) -> R) -> R {
    let home = tempfile::tempdir().expect("tempdir");
    fern_cli_sdk::auth::set_active_store(std::sync::Arc::new(
        fern_cli_sdk::auth::FileKeyringStore::at_root(home.path().to_path_buf()),
    ));
    let prev: Vec<(&str, Option<std::ffi::OsString>)> =
        ["HOME", "USERPROFILE", "BSC_USERNAME", "BSC_PASSWORD"]
            .iter()
            .map(|k| (*k, std::env::var_os(k)))
            .collect();
    std::env::set_var("HOME", home.path());
    std::env::set_var("USERPROFILE", home.path());
    std::env::remove_var("BSC_USERNAME");
    std::env::remove_var("BSC_PASSWORD");

    let result = f(home.path());

    for (key, value) in prev {
        match value {
            Some(v) => std::env::set_var(key, v),
            None => std::env::remove_var(key),
        }
    }
    result
}

/// Write the entry `auth login` would produce, without needing stdin.
fn store_basic(profile: &str, username: &str, password: &str) {
    let value = serde_json::json!({ "username": username, "password": password }).to_string();
    fern_cli_sdk::auth::active_store()
        .set("bsc", &format!("basic#{profile}"), &value)
        .expect("store");
}

#[test]
#[serial]
fn a_stored_basic_credential_is_actually_read_back() {
    // The regression: this reported `logged_in=false` no matter what was
    // stored, because `inject_keyring_sources` skipped `Basic` entirely.
    with_clean_env(|_| {
        run(&["bsc", "profiles", "create", "prod", "--use"]);
        assert!(!logged_in(None), "should start logged out");

        store_basic("prod", "AC1234", "authtoken");
        assert!(logged_in(None), "the stored credential must be read back");
    });
}

#[test]
#[serial]
fn both_halves_must_be_present() {
    // Basic is two *required* slots — a half-written entry is not a login.
    with_clean_env(|_| {
        run(&["bsc", "profiles", "create", "prod", "--use"]);
        let value = serde_json::json!({ "username": "AC1234" }).to_string();
        fern_cli_sdk::auth::active_store()
            .set("bsc", "basic#prod", &value)
            .unwrap();
        assert!(!logged_in(None), "username alone is not a credential");
    });
}

#[test]
#[serial]
fn a_raw_non_json_entry_does_not_leak_in_as_a_username() {
    // A pre-existing `--with-token` paste, or a hand-edited entry, is not a
    // basic credential. Surfacing it as the username would send a garbage
    // Authorization header the server rejects for invisible reasons.
    with_clean_env(|_| {
        run(&["bsc", "profiles", "create", "prod", "--use"]);
        fern_cli_sdk::auth::active_store()
            .set("bsc", "basic#prod", "just-a-raw-string")
            .unwrap();
        assert!(!logged_in(None));
    });
}

#[test]
#[serial]
fn two_profiles_hold_independent_basic_credentials() {
    with_clean_env(|_| {
        run(&["bsc", "profiles", "create", "prod"]);
        run(&["bsc", "profiles", "create", "staging"]);
        store_basic("prod", "AC1234", "prod-token");

        assert!(logged_in(Some("prod")));
        assert!(!logged_in(Some("staging")), "staging must be unaffected");

        store_basic("staging", "AC9999", "staging-token");
        assert!(logged_in(Some("staging")));
        assert!(logged_in(Some("prod")), "prod must survive staging's login");
    });
}

#[test]
#[serial]
fn a_subaccount_profile_borrows_the_parents_basic_credential() {
    // The Twilio case: act on a different AccountSid without a second login.
    with_clean_env(|_| {
        run(&["bsc", "profiles", "create", "sierra-prod", "--set", "AccountSid=AC1234"]);
        run(&[
            "bsc", "profiles", "create", "tenant-acme",
            "--parent", "sierra-prod", "--set", "AccountSid=AC99",
        ]);
        store_basic("sierra-prod", "AC1234", "authtoken");

        assert!(logged_in(Some("tenant-acme")), "child should read the parent's entry");
    });
}

#[test]
#[serial]
fn the_shadow_warning_names_the_schemes_real_env_vars() {
    // It used to *guess* candidate names from the CLI and scheme
    // (`<CLI>_<SCHEME>`, `<CLI>_TOKEN`, …), which silently missed the
    // common case: a scheme called `account_id_auth_token` reading
    // `BSC_USERNAME` / `BSC_PASSWORD`. The warning never fired on the
    // configuration it exists for. It now reads the declared sources.
    with_clean_env(|_| {
        std::env::set_var("BSC_USERNAME", "AC1234");
        std::env::set_var("BSC_PASSWORD", "authtoken");

        let candidates = fern_cli_sdk::auth::shadowing_env_vars(
            "bsc",
            "basic",
            &[(
                "basic".to_string(),
                fern_cli_sdk::auth::SchemeBinding::Basic {
                    username: fern_cli_sdk::auth::AuthCredentialSource::from_env("BSC_USERNAME"),
                    password: fern_cli_sdk::auth::AuthCredentialSource::from_env("BSC_PASSWORD"),
                },
            )],
        );
        assert!(candidates.contains(&"BSC_USERNAME".to_string()), "{candidates:?}");
        assert!(candidates.contains(&"BSC_PASSWORD".to_string()), "{candidates:?}");
        // And none of the old guesses, which matched nothing real.
        assert!(!candidates.iter().any(|c| c == "BSC_TOKEN"), "{candidates:?}");
    });
}

#[test]
#[serial]
fn the_shadow_warning_falls_back_when_the_scheme_is_unknown() {
    // `auth login --with-token --scheme <name>` on a CLI that declares no
    // bindings has nothing to read, so the name-derived guesses are all
    // that is available.
    with_clean_env(|_| {
        let candidates = fern_cli_sdk::auth::shadowing_env_vars("bsc", "mystery", &[]);
        assert!(candidates.contains(&"BSC_MYSTERY".to_string()), "{candidates:?}");
        assert!(candidates.contains(&"BSC_TOKEN".to_string()), "{candidates:?}");
    });
}

#[test]
#[serial]
fn env_vars_still_satisfy_basic_with_no_profile() {
    // The pre-profiles path must be untouched.
    with_clean_env(|_| {
        std::env::set_var("BSC_USERNAME", "AC1234");
        std::env::set_var("BSC_PASSWORD", "authtoken");
        assert!(logged_in(None));
    });
}

#[test]
#[serial]
fn the_profiles_tenant_parameter_reaches_the_request() {
    with_clean_env(|_| {
        run(&["bsc", "profiles", "create", "prod", "--set", "AccountSid=AC1234", "--use"]);
        store_basic("prod", "AC1234", "authtoken");
        let (code, output) = run(&[
            "bsc", "messages", "list", "--dry-run", "--format", "json",
        ]);
        assert_eq!(code, 0, "{output}");
        assert!(
            output.contains("/Accounts/AC1234/Messages"),
            "the profile's AccountSid should be in the path: {output}",
        );
    });
}
