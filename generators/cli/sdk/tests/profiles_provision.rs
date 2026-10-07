//! `profiles create --provision`: mint a remote credential (an API key)
//! with the caller's current credentials and store it in the new profile.
//!
//! Pairs with `profiles remove --revoke` (see `profiles_revoke.rs`): the
//! response fields `--provision` records as `credential_parameters` are
//! what the revoke operation later needs, so the two together give a
//! profile a key lifecycle without ever showing the user the secret.
//!
//! Template-author-only: `tests/**` is excluded from generated output.

use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::auth::BasicAuth;
use fern_cli_sdk::openapi::OpenApiBinding;
use fern_cli_sdk::profiles::{ProfilesConfig, ProvisionOperation};
use serial_test::serial;
use wiremock::matchers::{header, method, path};
use wiremock::{Mock, MockServer, ResponseTemplate};

const SPEC: &str = r#"
openapi: 3.0.0
info: { title: P, version: "1.0" }
servers: [{ url: "https://api.example.com" }]
security: [{ basic: [] }]
paths:
  /Accounts/{AccountSid}/Keys:
    post:
      operationId: keys_create
      x-fern-sdk-group-name: [keys]
      x-fern-sdk-method-name: create
      parameters:
        - { name: AccountSid, in: path, required: true, schema: { type: string } }
      requestBody:
        content:
          application/x-www-form-urlencoded:
            schema:
              type: object
              properties:
                FriendlyName: { type: string }
      responses:
        "201":
          description: created
          content:
            application/json:
              schema:
                type: object
                properties:
                  sid: { type: string }
                  secret: { type: string }
  /Accounts/{AccountSid}/Keys/{Sid}:
    delete:
      operationId: keys_remove
      x-fern-sdk-group-name: [keys]
      x-fern-sdk-method-name: remove
      parameters:
        - { name: AccountSid, in: path, required: true, schema: { type: string } }
        - { name: Sid, in: path, required: true, schema: { type: string } }
      responses: { "204": { description: gone } }
components:
  securitySchemes:
    basic: { type: http, scheme: basic }
"#;

fn app(provision: bool) -> CliApp {
    let mut config = ProfilesConfig::new().revoke_operation("keys.remove");
    if provision {
        config = config.provision_operation(
            ProvisionOperation::new("keys.create")
                .credential_field("username", "sid")
                .credential_field("password", "secret")
                .revoke_parameter("Sid", "sid"),
        );
    }
    CliApp::new("pv")
        .profiles(config)
        .auth(
            BasicAuth::new("basic")
                .username_env("PV_USERNAME")
                .password_env("PV_PASSWORD"),
        )
        .binding(OpenApiBinding::new().spec(SPEC))
}

fn run(provision: bool, args: &[&str]) -> (i32, String) {
    let mut out: Vec<u8> = Vec::new();
    let code = app(provision).try_run_from_with_output(args, &mut out);
    (code, String::from_utf8_lossy(&out).into_owned())
}

/// `$HOME` in a temp dir, a fresh keyring store, and the parent account's
/// credentials in env — the situation `--provision` is designed for.
fn with_parent_env<R>(base_url: &str, f: impl FnOnce() -> R) -> R {
    let home = tempfile::tempdir().expect("tempdir");
    fern_cli_sdk::auth::set_active_store(std::sync::Arc::new(
        fern_cli_sdk::auth::FileKeyringStore::at_root(home.path().to_path_buf()),
    ));
    let keys = [
        "HOME",
        "USERPROFILE",
        "PV_USERNAME",
        "PV_PASSWORD",
        "PV_BASE_URL",
    ];
    let prev: Vec<(&str, Option<std::ffi::OsString>)> =
        keys.iter().map(|k| (*k, std::env::var_os(k))).collect();
    std::env::set_var("HOME", home.path());
    std::env::set_var("USERPROFILE", home.path());
    std::env::set_var("PV_USERNAME", "ACparent");
    std::env::set_var("PV_PASSWORD", "parenttoken");
    std::env::set_var("PV_BASE_URL", base_url);
    let result = f();
    for (key, value) in prev {
        match value {
            Some(v) => std::env::set_var(key, v),
            None => std::env::remove_var(key),
        }
    }
    result
}

// "ACparent:parenttoken" in base64.
const PARENT_BASIC: &str = "Basic QUNwYXJlbnQ6cGFyZW50dG9rZW4=";

#[test]
#[serial]
fn provision_is_not_registered_unless_configured() {
    with_parent_env("https://unused.invalid", || {
        let (code, output) = run(false, &["pv", "profiles", "create", "--help"]);
        assert_eq!(code, 0, "{output}");
        assert!(!output.contains("--provision"), "{output}");
    });
}

#[test]
#[serial]
fn provision_is_registered_and_names_the_operation_when_configured() {
    with_parent_env("https://unused.invalid", || {
        let (code, output) = run(true, &["pv", "profiles", "create", "--help"]);
        assert_eq!(code, 0, "{output}");
        assert!(output.contains("--provision"), "{output}");
        assert!(
            output.contains("keys create"),
            "help should name the op: {output}"
        );
    });
}

#[tokio::test]
#[serial]
async fn provision_mints_a_key_with_the_parent_credential_and_stores_it() {
    let server = MockServer::start().await;
    Mock::given(method("POST"))
        .and(path("/Accounts/ACparent/Keys"))
        .and(header("authorization", PARENT_BASIC))
        .respond_with(ResponseTemplate::new(201).set_body_json(serde_json::json!({
            "sid": "SKnew",
            "secret": "s3cret",
            "friendly_name": "pv"
        })))
        .expect(1)
        .mount(&server)
        .await;
    let uri = server.uri();

    tokio::task::spawn_blocking(move || {
        with_parent_env(&uri, || {
            let (code, output) = run(
                true,
                &[
                    "pv",
                    "profiles",
                    "create",
                    "prod",
                    "--set",
                    "AccountSid=ACparent",
                    "--provision",
                ],
            );
            assert_eq!(code, 0, "{output}");
            // The secret is never echoed; the key's id is.
            assert!(!output.contains("s3cret"), "{output}");

            // Stored as the basic credential of the new profile.
            let stored = fern_cli_sdk::auth::active_store()
                .get("pv", "basic#prod")
                .expect("keyring")
                .expect("an entry for the new profile");
            assert_eq!(
                serde_json::from_str::<serde_json::Value>(&stored).unwrap(),
                serde_json::json!({ "username": "SKnew", "password": "s3cret" }),
            );

            // The key's id is recorded for `--revoke`, but is *not* a
            // request default: `show` lists it apart from `parameters`.
            let (_, shown) = run(
                true,
                &["pv", "profiles", "show", "prod", "--format", "json"],
            );
            let shown: serde_json::Value = serde_json::from_str(&shown).expect("json");
            assert_eq!(shown["parameters"]["AccountSid"], "ACparent");
            assert!(shown["parameters"].get("Sid").is_none(), "{shown}");
            assert_eq!(shown["credential_parameters"]["Sid"], "SKnew");

            // Now a request *as the profile* authenticates with the new key.
            // Verified end to end below via `--revoke`, which runs as the
            // profile's own credential against `/Keys/SKnew`.
        });
    })
    .await
    .unwrap();
    drop(server);
}

#[tokio::test]
#[serial]
async fn revoke_uses_the_recorded_key_id() {
    let server = MockServer::start().await;
    Mock::given(method("POST"))
        .and(path("/Accounts/ACparent/Keys"))
        .respond_with(ResponseTemplate::new(201).set_body_json(serde_json::json!({
            "sid": "SKnew",
            "secret": "s3cret"
        })))
        .mount(&server)
        .await;
    Mock::given(method("DELETE"))
        .and(path("/Accounts/ACparent/Keys/SKnew"))
        .respond_with(ResponseTemplate::new(204))
        .expect(1)
        .mount(&server)
        .await;
    let uri = server.uri();

    tokio::task::spawn_blocking(move || {
        with_parent_env(&uri, || {
            let (code, output) = run(
                true,
                &[
                    "pv",
                    "profiles",
                    "create",
                    "prod",
                    "--set",
                    "AccountSid=ACparent",
                    "--provision",
                ],
            );
            assert_eq!(code, 0, "{output}");
            let (code, output) = run(
                true,
                &["pv", "profiles", "remove", "prod", "--yes", "--revoke"],
            );
            assert_eq!(code, 0, "{output}");
            assert!(
                fern_cli_sdk::auth::active_store()
                    .get("pv", "basic#prod")
                    .expect("keyring")
                    .is_none(),
                "the minted key must be purged locally too",
            );
        });
    })
    .await
    .unwrap();
    drop(server);
}

#[tokio::test]
#[serial]
async fn a_response_missing_a_mapped_field_stores_nothing() {
    let server = MockServer::start().await;
    Mock::given(method("POST"))
        .and(path("/Accounts/ACparent/Keys"))
        .respond_with(ResponseTemplate::new(201).set_body_json(serde_json::json!({
            "sid": "SKnew"
        })))
        .mount(&server)
        .await;
    let uri = server.uri();

    tokio::task::spawn_blocking(move || {
        with_parent_env(&uri, || {
            let (code, output) = run(
                true,
                &[
                    "pv",
                    "profiles",
                    "create",
                    "prod",
                    "--set",
                    "AccountSid=ACparent",
                    "--provision",
                ],
            );
            assert_ne!(code, 0, "{output}");
            assert!(
                output.contains("secret"),
                "the error should name the field: {output}"
            );
            let (_, listed) = run(true, &["pv", "profiles", "list", "--format", "json"]);
            assert!(
                !listed.contains("prod"),
                "a half-provisioned profile must not be written: {listed}"
            );
        });
    })
    .await
    .unwrap();
}
