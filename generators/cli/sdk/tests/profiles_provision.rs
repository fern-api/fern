//! `profiles create --provision`: mint a remote credential for a profile,
//! store it, remember its id, and hand that id back to `remove --revoke`.
//!
//! Driven against a real mock server: the request has to go out signed
//! with the *bootstrap* credential (the user's own, used once), and the
//! revoke has to name the key the create minted.
//!
//! Template-author-only: `tests/**` is excluded from generated output.

use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::auth::BasicAuth;
use fern_cli_sdk::openapi::OpenApiBinding;
use fern_cli_sdk::profiles::{ProfilesConfig, ProvisionOperation};
use serial_test::serial;
use wiremock::matchers::{basic_auth, body_partial_json, method, path};
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
          application/json:
            schema:
              type: object
              properties:
                FriendlyName: { type: string }
      responses: { "201": { description: created } }
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
    let mut config = ProfilesConfig::new()
        .revoke_operation("keys.remove")
        .revoke_credential_id_parameter("Sid");
    if provision {
        config = config.provision_operation(
            ProvisionOperation::new("keys.create")
                .argument("FriendlyName", "{cli} for {profile}")
                .credential_field("username", "sid")
                .credential_field("password", "secret")
                .credential_id("sid"),
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

/// `$HOME` in a temp dir, a fresh keyring store, and the scheme's env vars
/// cleared. `#[serial]` is mandatory — all three are process-global.
fn with_clean_env<R>(f: impl FnOnce() -> R) -> R {
    let home = tempfile::tempdir().expect("tempdir");
    fern_cli_sdk::auth::set_active_store(std::sync::Arc::new(
        fern_cli_sdk::auth::FileKeyringStore::at_root(home.path().to_path_buf()),
    ));
    let vars = [
        "HOME",
        "USERPROFILE",
        "PV_USERNAME",
        "PV_PASSWORD",
        "PV_BASE_URL",
    ];
    let prev: Vec<(&str, Option<std::ffi::OsString>)> =
        vars.iter().map(|k| (*k, std::env::var_os(k))).collect();
    for k in &vars[2..] {
        std::env::remove_var(k);
    }
    std::env::set_var("HOME", home.path());
    std::env::set_var("USERPROFILE", home.path());
    let r = f();
    for (k, v) in prev {
        match v {
            Some(value) => std::env::set_var(k, value),
            None => std::env::remove_var(k),
        }
    }
    r
}

fn show(name: &str) -> serde_json::Value {
    let (code, output) = run(true, &["pv", "profiles", "show", name, "--format", "json"]);
    assert_eq!(code, 0, "{output}");
    serde_json::from_str(&output).expect("json")
}

fn logged_in(profile: &str) -> bool {
    let (_, output) = run(
        true,
        &["pv", "auth", "status", "--format", "json", "-p", profile],
    );
    let parsed: serde_json::Value = serde_json::from_str(&output).expect("json");
    parsed["schemes"][0]["logged_in"] == serde_json::Value::Bool(true)
}

#[test]
#[serial]
fn provision_is_not_registered_unless_configured() {
    with_clean_env(|| {
        let (code, output) = run(false, &["pv", "profiles", "create", "--help"]);
        assert_eq!(code, 0, "{output}");
        assert!(!output.contains("--provision"), "{output}");

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
async fn provision_mints_stores_and_revokes_by_id() {
    let server = MockServer::start().await;
    Mock::given(method("POST"))
        .and(path("/Accounts/AC1/Keys"))
        // Signed with the bootstrap credential from the environment, and
        // labelled with the substituted fixed argument.
        .and(basic_auth("ACparent", "parent-token"))
        .and(body_partial_json(
            serde_json::json!({ "FriendlyName": "pv for prod" }),
        ))
        .respond_with(ResponseTemplate::new(201).set_body_json(serde_json::json!({
            "sid": "SK1",
            "secret": "very-secret",
            "friendly_name": "pv for prod"
        })))
        .expect(1)
        .mount(&server)
        .await;
    Mock::given(method("DELETE"))
        .and(path("/Accounts/AC1/Keys/SK1"))
        // Revoked *as the profile* — the stored key, not the bootstrap one.
        .and(basic_auth("SK1", "very-secret"))
        .respond_with(ResponseTemplate::new(204))
        .expect(1)
        .mount(&server)
        .await;
    let uri = server.uri();

    tokio::task::spawn_blocking(move || {
        with_clean_env(|| {
            std::env::set_var("PV_BASE_URL", &uri);
            std::env::set_var("PV_USERNAME", "ACparent");
            std::env::set_var("PV_PASSWORD", "parent-token");
            let (code, output) = run(
                true,
                &[
                    "pv",
                    "profiles",
                    "create",
                    "prod",
                    "--set",
                    "AccountSid=AC1",
                    "--provision",
                    "--from-env",
                ],
            );
            assert_eq!(code, 0, "{output}");

            // The bootstrap credential is gone from the environment from
            // here on: everything below runs on the minted one.
            std::env::remove_var("PV_USERNAME");
            std::env::remove_var("PV_PASSWORD");

            let shown = show("prod");
            assert_eq!(shown["credential_id"], "SK1", "{shown}");
            assert_eq!(
                shown["account"], "SK1",
                "the minted username is the account: {shown}"
            );
            assert!(
                !shown.to_string().contains("very-secret"),
                "the secret must never be printed: {shown}"
            );
            assert!(
                logged_in("prod"),
                "the minted credential must satisfy the scheme"
            );

            let (_, listed) = run(true, &["pv", "profiles", "list", "--format", "json"]);
            assert!(
                listed.contains("\"credential_id\":\"SK1\"")
                    || listed.contains("\"credential_id\": \"SK1\""),
                "{listed}"
            );
            assert!(!listed.contains("very-secret"), "{listed}");

            let (code, output) = run(
                true,
                &["pv", "profiles", "remove", "prod", "--yes", "--revoke"],
            );
            assert_eq!(code, 0, "{output}");
            let (_, listed) = run(true, &["pv", "profiles", "list", "--format", "json"]);
            assert!(!listed.contains("prod"), "{listed}");
        });
    })
    .await
    .unwrap();

    drop(server);
}

#[tokio::test]
#[serial]
async fn a_failed_provision_leaves_no_profile_behind() {
    let server = MockServer::start().await;
    Mock::given(method("POST"))
        .and(path("/Accounts/AC1/Keys"))
        .respond_with(ResponseTemplate::new(403).set_body_json(serde_json::json!({
            "message": "not permitted"
        })))
        .mount(&server)
        .await;
    let uri = server.uri();

    tokio::task::spawn_blocking(move || {
        with_clean_env(|| {
            std::env::set_var("PV_BASE_URL", &uri);
            std::env::set_var("PV_USERNAME", "ACparent");
            std::env::set_var("PV_PASSWORD", "parent-token");
            let (code, output) = run(
                true,
                &[
                    "pv",
                    "profiles",
                    "create",
                    "prod",
                    "--set",
                    "AccountSid=AC1",
                    "--provision",
                    "--from-env",
                ],
            );
            assert_ne!(code, 0, "{output}");

            // (The env pseudo-row is still listed; the point is that `prod` is not.)
            let (_, listed) = run(true, &["pv", "profiles", "list", "--format", "json"]);
            assert!(
                !listed.contains("prod"),
                "a refused mint must not persist a half-made profile: {listed}"
            );
            std::env::remove_var("PV_USERNAME");
            std::env::remove_var("PV_PASSWORD");
            let (code, _) = run(true, &["pv", "profiles", "show", "prod"]);
            assert_ne!(code, 0, "no profile, no credential");
        });
    })
    .await
    .unwrap();
}

#[tokio::test]
#[serial]
async fn a_response_missing_the_mapped_field_is_reported_and_stores_nothing() {
    let server = MockServer::start().await;
    Mock::given(method("POST"))
        .and(path("/Accounts/AC1/Keys"))
        .respond_with(ResponseTemplate::new(201).set_body_json(serde_json::json!({
            "sid": "SK1"
        })))
        .mount(&server)
        .await;
    let uri = server.uri();

    tokio::task::spawn_blocking(move || {
        with_clean_env(|| {
            std::env::set_var("PV_BASE_URL", &uri);
            std::env::set_var("PV_USERNAME", "ACparent");
            std::env::set_var("PV_PASSWORD", "parent-token");
            let (code, output) = run(
                true,
                &[
                    "pv",
                    "profiles",
                    "create",
                    "prod",
                    "--set",
                    "AccountSid=AC1",
                    "--provision",
                    "--from-env",
                ],
            );
            assert_ne!(code, 0, "{output}");
            assert!(
                output.contains("`secret`"),
                "names the missing field: {output}"
            );
            let (_, listed) = run(true, &["pv", "profiles", "list", "--format", "json"]);
            assert!(!listed.contains("prod"), "{listed}");
        });
    })
    .await
    .unwrap();
}

#[test]
#[serial]
fn provision_without_a_bootstrap_credential_in_env_is_a_clear_error() {
    with_clean_env(|| {
        let (code, output) = run(
            true,
            &[
                "pv",
                "profiles",
                "create",
                "prod",
                "--set",
                "AccountSid=AC1",
                "--provision",
                "--from-env",
            ],
        );
        assert_ne!(code, 0, "{output}");
        assert!(output.contains("--from-env"), "{output}");
        let (_, listed) = run(true, &["pv", "profiles", "list", "--format", "json"]);
        assert_eq!(
            serde_json::from_str::<serde_json::Value>(&listed).unwrap(),
            serde_json::json!([]),
        );
    });
}

#[test]
#[serial]
fn revoke_without_a_credential_id_names_the_parameter_and_the_fix() {
    with_clean_env(|| {
        run(
            true,
            &[
                "pv",
                "profiles",
                "create",
                "prod",
                "--set",
                "AccountSid=AC1",
            ],
        );
        let (code, output) = run(
            true,
            &["pv", "profiles", "remove", "prod", "--yes", "--revoke"],
        );
        assert_ne!(code, 0, "{output}");
        assert!(output.contains("`Sid`"), "{output}");
        assert!(output.contains("--provision"), "{output}");
        let (_, listed) = run(true, &["pv", "profiles", "list", "--format", "json"]);
        assert!(
            listed.contains("prod"),
            "the profile must survive: {listed}"
        );
    });
}

#[tokio::test]
#[serial]
async fn a_stored_parameter_is_the_manual_fallback_for_the_credential_id() {
    let server = MockServer::start().await;
    Mock::given(method("DELETE"))
        .and(path("/Accounts/AC1/Keys/SK9"))
        .respond_with(ResponseTemplate::new(204))
        .expect(1)
        .mount(&server)
        .await;
    let uri = server.uri();

    tokio::task::spawn_blocking(move || {
        with_clean_env(|| {
            std::env::set_var("PV_BASE_URL", &uri);
            std::env::set_var("PV_USERNAME", "ACparent");
            std::env::set_var("PV_PASSWORD", "parent-token");
            run(
                true,
                &[
                    "pv",
                    "profiles",
                    "create",
                    "prod",
                    "--set",
                    "AccountSid=AC1",
                    "--set",
                    "Sid=SK9",
                ],
            );
            let (code, output) = run(
                true,
                &["pv", "profiles", "remove", "prod", "--yes", "--revoke"],
            );
            assert_eq!(code, 0, "{output}");
        });
    })
    .await
    .unwrap();
    drop(server);
}

#[test]
#[serial]
fn credential_id_is_owned_not_inherited() {
    // A child that borrows its parent's credential must not report (and so
    // must not be able to revoke) the parent's key.
    with_clean_env(|| {
        run(
            true,
            &[
                "pv",
                "profiles",
                "create",
                "prod",
                "--set",
                "AccountSid=AC1",
            ],
        );
        // Simulate a provisioned parent by writing the id the way `create
        // --provision` does, via the store.
        let store_path = {
            let (_, output) = run(
                true,
                &["pv", "profiles", "show", "prod", "--format", "json"],
            );
            assert!(output.contains("prod"), "{output}");
            fern_cli_sdk::profiles::ProfileStore::for_cli("pv").expect("store")
        };
        let mut store = store_path;
        let mut entry = store.entry("prod").expect("entry");
        entry.credential_id = Some("SK1".to_string());
        store.upsert(&entry);
        store.save().expect("save");

        run(
            true,
            &[
                "pv",
                "profiles",
                "create",
                "sub",
                "--parent",
                "prod",
                "--set",
                "AccountSid=AC2",
            ],
        );
        assert_eq!(show("prod")["credential_id"], "SK1");
        assert!(
            show("sub").get("credential_id").is_none(),
            "{}",
            show("sub")
        );
    });
}
