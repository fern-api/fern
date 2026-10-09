//! `x-fern-idempotent: true` must not disable the auto `Idempotency-Key`.
//!
//! The marker only means the operation *exposes* `--idempotency-key`; it is
//! not a promise the caller passed it. Treating it as "the caller provides a
//! key" inverted the safety property the marker exists for, because the same
//! marker also makes the operation retry-eligible: a marked POST invoked
//! without the flag retried with no key at all, while the same POST *without*
//! the marker got an auto-generated key reused across attempts.
use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::openapi::OpenApiBinding;

fn spec(marked: bool) -> String {
    let marker = if marked {
        "      x-fern-idempotent: true\n"
    } else {
        ""
    };
    format!(
        r#"
openapi: 3.0.0
info: {{ title: Probe API, version: "1.0" }}
x-fern-idempotency-headers:
  - header: Idempotency-Key
paths:
  /messages:
    post:
      operationId: messages_send
      tags: [messages]
{marker}      responses:
        "200": {{ description: ok }}
"#
    )
}

/// Run `messages send` against a mock that always 500s, and return the
/// `Idempotency-Key` seen on each attempt.
fn keys_across_attempts(marked: bool) -> Vec<String> {
    keys_across_attempts_with(marked, &[])
}

fn keys_across_attempts_with(marked: bool, extra_args: &[&str]) -> Vec<String> {
    let rt = tokio::runtime::Runtime::new().expect("runtime");
    let server: &'static wiremock::MockServer = rt.block_on(async {
        let server = wiremock::MockServer::start().await;
        wiremock::Mock::given(wiremock::matchers::method("POST"))
            .respond_with(wiremock::ResponseTemplate::new(500))
            .mount(&server)
            .await;
        Box::leak(Box::new(server))
    });
    let uri = server.uri();
    let app = CliApp::new("probe-cli").binding(OpenApiBinding::new().spec(&spec(marked)));
    let mut out: Vec<u8> = Vec::new();
    let mut argv: Vec<&str> = vec!["probe-cli", "--base-url", &uri, "messages", "send"];
    argv.extend_from_slice(extra_args);
    app.try_run_from_with_output(argv, &mut out);
    rt.block_on(server.received_requests())
        .expect("recorded requests")
        .iter()
        .map(|request| {
            request
                .headers
                .get("idempotency-key")
                .map(|value| value.to_str().expect("utf-8").to_string())
                .unwrap_or_else(|| "<MISSING>".to_string())
        })
        .collect()
}

#[test]
fn marked_idempotent_post_still_carries_one_reused_key() {
    let keys = keys_across_attempts(true);
    assert!(
        keys.len() > 1,
        "the marker should make the POST retry-eligible, got {} attempt(s)",
        keys.len(),
    );
    assert!(
        !keys.iter().any(|k| k == "<MISSING>"),
        "every attempt must carry a key, got: {keys:?}",
    );
    assert!(
        keys.windows(2).all(|w| w[0] == w[1]),
        "the same key must be reused across attempts, got: {keys:?}",
    );
}

#[test]
fn unmarked_post_is_not_retried() {
    // Regression guard for the other half of the report: a plain POST must
    // not auto-retry at all, marker or no marker.
    let keys = keys_across_attempts(false);
    assert_eq!(
        keys.len(),
        1,
        "an unmarked POST must make exactly one attempt, got: {keys:?}",
    );
}

#[test]
fn explicit_key_is_used_verbatim_and_not_overwritten() {
    // `--idempotency-key` is only registered where the spec declares
    // `x-fern-idempotent: true`, so this is the reachable explicit-key case.
    // The caller's key must reach every attempt unchanged — the auto-generator
    // must stand down rather than replace it.
    let keys = keys_across_attempts_with(true, &["--idempotency-key", "caller-key-1"]);
    assert!(
        keys.len() > 1,
        "a marked POST should retry, got {} attempt(s)",
        keys.len(),
    );
    assert!(
        keys.iter().all(|k| k == "caller-key-1"),
        "the caller's key must be reused verbatim, got: {keys:?}",
    );
}
