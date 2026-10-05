//! `profiles remove --revoke`, and the `Binding::invoke_operation` seam it
//! runs on.
//!
//! The seam exists because framework-owned commands sometimes need to call
//! the API on the user's behalf, and have no `ArgMatches` for the target
//! operation to hand to `dispatch`. Everything downstream — auth, retries,
//! TLS, base-URL resolution — is the same stack a normal invocation uses.
//!
//! Driven against a real mock server, because the whole point is that a
//! request actually goes out.
//!
//! Template-author-only: `tests/**` is excluded from generated output.

use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::openapi::OpenApiBinding;
use fern_cli_sdk::profiles::ProfilesConfig;
use serial_test::serial;
use wiremock::matchers::{method, path};
use wiremock::{Mock, MockServer, ResponseTemplate};

const SPEC: &str = r#"
openapi: 3.0.0
info: { title: R, version: "1.0" }
servers: [{ url: "https://api.example.com" }]
paths:
  /Keys/{KeySid}:
    delete:
      operationId: keys_remove
      x-fern-sdk-group-name: [keys]
      x-fern-sdk-method-name: remove
      parameters:
        - { name: KeySid, in: path, required: true, schema: { type: string } }
      responses: { "200": { description: ok } }
"#;

fn app(revoke: bool) -> CliApp {
    let mut config = ProfilesConfig::new();
    if revoke {
        config = config.revoke_operation("keys.remove");
    }
    CliApp::new("rv")
        .profiles(config)
        .binding(OpenApiBinding::new().spec(SPEC))
}

fn run(revoke: bool, args: &[&str]) -> (i32, String) {
    let mut out: Vec<u8> = Vec::new();
    let code = app(revoke).try_run_from_with_output(args, &mut out);
    (code, String::from_utf8_lossy(&out).into_owned())
}

fn with_temp_home<R>(f: impl FnOnce() -> R) -> R {
    let home = tempfile::tempdir().expect("tempdir");
    let prev = std::env::var_os("HOME");
    let prev_up = std::env::var_os("USERPROFILE");
    let prev_base = std::env::var_os("RV_BASE_URL");
    std::env::set_var("HOME", home.path());
    std::env::set_var("USERPROFILE", home.path());
    let r = f();
    for (k, v) in [("HOME", prev), ("USERPROFILE", prev_up), ("RV_BASE_URL", prev_base)] {
        match v {
            Some(value) => std::env::set_var(k, value),
            None => std::env::remove_var(k),
        }
    }
    r
}

#[test]
#[serial]
fn revoke_is_not_registered_unless_configured() {
    // A flag advertising a capability the binary lacks is worse than no flag.
    with_temp_home(|| {
        let (code, output) = run(false, &["rv", "profiles", "remove", "--help"]);
        assert_eq!(code, 0, "{output}");
        assert!(!output.contains("--revoke"), "{output}");
    });
}

#[test]
#[serial]
fn revoke_is_registered_and_names_the_operation_when_configured() {
    with_temp_home(|| {
        let (code, output) = run(true, &["rv", "profiles", "remove", "--help"]);
        assert_eq!(code, 0, "{output}");
        assert!(output.contains("--revoke"), "{output}");
        assert!(output.contains("keys remove"), "help should name the op: {output}");
    });
}

#[tokio::test]
#[serial]
async fn revoke_calls_the_operation_then_removes_the_profile() {
    let server = MockServer::start().await;
    Mock::given(method("DELETE"))
        .and(path("/Keys/SK123"))
        .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({})))
        .expect(1)
        .mount(&server)
        .await;
    let uri = server.uri();

    // `try_run_from_with_output` builds its own runtime, so the blocking
    // calls have to happen off this test's async context.
    tokio::task::spawn_blocking(move || {
        with_temp_home(|| {
            std::env::set_var("RV_BASE_URL", &uri);
            let (code, output) = run(
                true,
                &["rv", "profiles", "create", "prod", "--set", "KeySid=SK123"],
            );
            assert_eq!(code, 0, "{output}");

            let (code, output) = run(true, &["rv", "profiles", "remove", "prod", "--yes", "--revoke"]);
            assert_eq!(code, 0, "{output}");

            // Gone locally too.
            let (_, listed) = run(true, &["rv", "profiles", "list", "--format", "json"]);
            assert_eq!(
                serde_json::from_str::<serde_json::Value>(&listed).unwrap(),
                serde_json::json!([]),
            );
        });
    })
    .await
    .unwrap();

    // `expect(1)` is asserted on drop.
    drop(server);
}

#[tokio::test]
#[serial]
async fn a_failed_revoke_leaves_the_profile_intact() {
    // The ordering that matters: revoke runs *before* any local deletion, so
    // a failure leaves something to retry rather than a live remote key with
    // no local record of it.
    let server = MockServer::start().await;
    Mock::given(method("DELETE"))
        .and(path("/Keys/SK123"))
        .respond_with(ResponseTemplate::new(403).set_body_json(serde_json::json!({
            "message": "not permitted"
        })))
        .mount(&server)
        .await;
    let uri = server.uri();

    tokio::task::spawn_blocking(move || {
        with_temp_home(|| {
            std::env::set_var("RV_BASE_URL", &uri);
            run(true, &["rv", "profiles", "create", "prod", "--set", "KeySid=SK123"]);

            let (code, output) = run(true, &["rv", "profiles", "remove", "prod", "--yes", "--revoke"]);
            assert_ne!(code, 0, "a rejected revoke must fail the command: {output}");

            let (_, listed) = run(true, &["rv", "profiles", "list", "--format", "json"]);
            assert!(listed.contains("prod"), "the profile must survive: {listed}");
        });
    })
    .await
    .unwrap();
}

#[tokio::test]
#[serial]
async fn removing_without_revoke_makes_no_request() {
    let server = MockServer::start().await;
    // Any request at all is a failure — `expect(0)`.
    Mock::given(method("DELETE"))
        .respond_with(ResponseTemplate::new(200))
        .expect(0)
        .mount(&server)
        .await;
    let uri = server.uri();

    tokio::task::spawn_blocking(move || {
        with_temp_home(|| {
            std::env::set_var("RV_BASE_URL", &uri);
            run(true, &["rv", "profiles", "create", "prod", "--set", "KeySid=SK123"]);
            let (code, output) = run(true, &["rv", "profiles", "remove", "prod", "--yes"]);
            assert_eq!(code, 0, "{output}");
        });
    })
    .await
    .unwrap();
    drop(server);
}

#[test]
#[serial]
fn a_missing_required_parameter_names_it() {
    // The profile is the only argument source, so a revoke operation needing
    // something the profile does not carry has to say which.
    with_temp_home(|| {
        run(true, &["rv", "profiles", "create", "bare"]);
        let (code, output) = run(true, &["rv", "profiles", "remove", "bare", "--yes", "--revoke"]);
        assert_ne!(code, 0, "{output}");
        assert!(output.contains("KeySid"), "the error should name it: {output}");
    });
}
