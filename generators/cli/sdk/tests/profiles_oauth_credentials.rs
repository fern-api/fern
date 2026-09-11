//! OAuth2 client credentials stored per profile.
//!
//! Two bugs this pins. `auth login --with-token` on a client-credentials
//! scheme used to write a raw string the provider never read — the entry
//! appeared, and the CLI still said "not logged in". And `credential_slots`
//! enumerated only env vars, so `auth status` reported a scheme as
//! unsatisfied even where the profile did supply the credential.
//!
//! The secret has no plaintext rung: it lives only in env or the keyring.
//! The client id may additionally sit in `profiles.toml`, because a client
//! id is public by construction (RFC 6749 §2.2).
//!
//! Template-author-only: `tests/**` is excluded from generated output.

use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::auth::OAuth2Auth;
use fern_cli_sdk::openapi::OpenApiBinding;
use fern_cli_sdk::profiles::ProfilesConfig;
use serial_test::serial;

const SPEC: &str = r#"
openapi: 3.0.0
info: { title: O, version: "1.0" }
servers: [{ url: "https://api.example.com" }]
paths:
  /things:
    get:
      operationId: things_list
      tags: [things]
      security: [{ oauth: [] }]
      responses: { "200": { description: ok } }
components:
  securitySchemes:
    oauth: { type: oauth2, flows: {} }
"#;

fn app() -> CliApp {
    CliApp::new("oa")
        .profiles(ProfilesConfig::new())
        .auth(
            OAuth2Auth::new("oauth")
                .client_id_env("OA_CLIENT_ID")
                .client_secret_env("OA_CLIENT_SECRET")
                .token_url("https://idp.example/token"),
        )
        .binding(OpenApiBinding::new().spec(SPEC))
}

fn run(args: &[&str]) -> (i32, String) {
    let mut out: Vec<u8> = Vec::new();
    let code = app().try_run_from_with_output(args, &mut out);
    (code, String::from_utf8_lossy(&out).into_owned())
}

fn status(profile: Option<&str>) -> serde_json::Value {
    let mut args = vec!["oa", "auth", "status", "--format", "json"];
    if let Some(p) = profile {
        args.extend_from_slice(&["-p", p]);
    }
    let parsed: serde_json::Value = serde_json::from_str(&run(&args).1).expect("json");
    parsed["schemes"]
        .as_array()
        .expect("schemes")
        .iter()
        .find(|s| s["scheme"] == "oauth")
        .cloned()
        .expect("oauth scheme")
}

fn logged_in(profile: Option<&str>) -> bool {
    status(profile)["logged_in"] == serde_json::Value::Bool(true)
}

fn sources(profile: Option<&str>) -> Vec<String> {
    status(profile)["sources"]
        .as_array()
        .unwrap()
        .iter()
        .map(|s| s["source"].as_str().unwrap_or_default().to_string())
        .collect()
}

/// Fresh `$HOME`, a fresh keyring store, and the scheme's env vars cleared.
/// `#[serial]` is mandatory — all three are process-global, and
/// `active_store()` caches its root at first use, so moving `$HOME` alone
/// would leak one test's credentials into the next.
fn with_clean_env<R>(f: impl FnOnce() -> R) -> R {
    let home = tempfile::tempdir().expect("tempdir");
    let keys = ["HOME", "USERPROFILE", "OA_CLIENT_ID", "OA_CLIENT_SECRET"];
    let prev: Vec<_> = keys.iter().map(|k| (*k, std::env::var_os(k))).collect();
    std::env::set_var("HOME", home.path());
    std::env::set_var("USERPROFILE", home.path());
    std::env::remove_var("OA_CLIENT_ID");
    std::env::remove_var("OA_CLIENT_SECRET");
    fern_cli_sdk::auth::set_active_store(std::sync::Arc::new(
        fern_cli_sdk::auth::FileKeyringStore::at_root(home.path().to_path_buf()),
    ));
    let result = f();
    for (key, value) in prev {
        match value {
            Some(v) => std::env::set_var(key, v),
            None => std::env::remove_var(key),
        }
    }
    result
}

fn store(profile: &str, client_id: &str, client_secret: &str) {
    let value = serde_json::json!({
        "client_id": client_id,
        "client_secret": client_secret,
    })
    .to_string();
    fern_cli_sdk::auth::active_store()
        .set("oa", &format!("oauth#{profile}"), &value)
        .expect("store");
}

#[test]
#[serial]
fn a_stored_client_credential_is_actually_read_back() {
    // The regression: this stayed false no matter what was stored, because
    // the provider only ever read env vars.
    with_clean_env(|| {
        run(&["oa", "profiles", "create", "prod", "--use"]);
        assert!(!logged_in(None), "should start logged out");

        store("prod", "id-1", "secret-1");
        assert!(logged_in(None), "the stored credential must be read back");
    });
}

#[test]
#[serial]
fn auth_status_lists_the_stored_rungs() {
    // The reporting half: the status surface has to name every rung the
    // resolvers consult, or it says "not logged in" about a working scheme.
    with_clean_env(|| {
        run(&["oa", "profiles", "create", "prod", "--use"]);
        store("prod", "id-1", "secret-1");

        let listed = sources(None);
        assert!(
            listed.iter().any(|s| s.contains("client_id") && s.contains("oauth#prod")),
            "{listed:?}",
        );
        assert!(
            listed.iter().any(|s| s.contains("client_secret") && s.contains("oauth#prod")),
            "{listed:?}",
        );
        // The env vars stay listed — a user asking "is OA_CLIENT_ID picked
        // up?" needs to see them either way.
        assert!(listed.iter().any(|s| s.contains("OA_CLIENT_ID")), "{listed:?}");
    });
}

#[test]
#[serial]
fn both_halves_are_required() {
    with_clean_env(|| {
        run(&["oa", "profiles", "create", "prod", "--use"]);
        fern_cli_sdk::auth::active_store()
            .set("oa", "oauth#prod", &serde_json::json!({"client_id": "id-1"}).to_string())
            .unwrap();
        assert!(!logged_in(None), "a client id alone is not a credential");
    });
}

#[test]
#[serial]
fn two_profiles_hold_independent_client_credentials() {
    with_clean_env(|| {
        run(&["oa", "profiles", "create", "prod"]);
        run(&["oa", "profiles", "create", "staging"]);
        store("prod", "prod-id", "prod-secret");

        assert!(logged_in(Some("prod")));
        assert!(!logged_in(Some("staging")), "no cross-read");
    });
}

#[test]
#[serial]
fn env_vars_still_win_over_a_stored_credential() {
    // Ambient precedence is unchanged: env above an active profile.
    with_clean_env(|| {
        run(&["oa", "profiles", "create", "prod", "--use"]);
        store("prod", "stored-id", "stored-secret");
        std::env::set_var("OA_CLIENT_ID", "env-id");
        std::env::set_var("OA_CLIENT_SECRET", "env-secret");

        let active: Vec<String> = status(None)["sources"]
            .as_array()
            .unwrap()
            .iter()
            .filter(|s| s["state"] == "active")
            .map(|s| s["source"].as_str().unwrap().to_string())
            .collect();
        assert!(
            active.iter().all(|s| s.contains("env var")),
            "env should win for an ambient profile: {active:?}",
        );
    });
}

#[test]
#[serial]
fn the_client_id_may_come_from_the_profile_but_the_secret_may_not() {
    // A client id is public (RFC 6749 §2.2) so `profiles.toml` is a
    // legitimate home for it. The secret has no plaintext rung, so a
    // profile carrying only the id is still not logged in.
    with_clean_env(|| {
        run(&["oa", "profiles", "create", "prod", "--oauth-client-id", "public-id", "--use"]);
        assert!(!logged_in(None), "an id without a secret is not a credential");

        let listed = sources(None);
        assert!(
            listed.iter().any(|s| s.contains("oauth_client_id in the active profile")),
            "the profile's client id should be reported as a rung: {listed:?}",
        );

        // Supply the secret by env and the scheme resolves.
        std::env::set_var("OA_CLIENT_SECRET", "s");
        assert!(logged_in(None));
    });
}

#[test]
#[serial]
fn an_unprofiled_credential_still_resolves() {
    // The compatibility guarantee: the bare slot keeps working.
    with_clean_env(|| {
        std::env::set_var("OA_CLIENT_ID", "i");
        std::env::set_var("OA_CLIENT_SECRET", "s");
        assert!(logged_in(None));
    });
}
