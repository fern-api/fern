//! Wire-level integration tests for the `openapi-31-fixture` CLI.
//!
//! Each test stands up a real `wiremock::MockServer`, points the generated CLI
//! at it via `OPENAPI_31_FIXTURE_BASE_URL`, runs a command, and asserts on
//! either the request that reached the mock or the response the CLI rendered.
//! Coverage targets the 3.1-distinct surface area added by the parser:
//!
//!   - `const` lowered to a single-element enum (wire value enforcement)
//!   - `type: [..., "null"]` (nullable optional flag + nullable response field)
//!   - Numeric `exclusiveMinimum / exclusiveMaximum` (round-trips on the wire)
//!   - Top-level `webhooks` (negative: never become CLI subcommands)
//!   - `oneOf` composition (parse-only; response with composition round-trips)
//!   - 3.1 `examples` arrays at the schema level (do not break parse)

use serde_json::json;
use std::process::Command;
use wiremock::matchers::{body_json, method, path};
use wiremock::{Mock, MockServer, ResponseTemplate};

fn fixture_cmd() -> Command {
    Command::new(env!("CARGO_BIN_EXE_openapi-31-fixture"))
}

fn live_cmd(server: &MockServer) -> Command {
    let mut cmd = fixture_cmd();
    cmd.env("OPENAPI_31_FIXTURE_BASE_URL", server.uri());
    cmd
}

fn assert_ok(output: &std::process::Output) {
    assert!(
        output.status.success(),
        "command failed; stderr: {}\nstdout: {}",
        String::from_utf8_lossy(&output.stderr),
        String::from_utf8_lossy(&output.stdout),
    );
}

// ---------------------------------------------------------------------------
// const → single-element enum
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_const_value_lands_on_the_wire() {
    // POST /events with the const-restricted `--type user.created` should
    // produce a request body whose `type` field is the const value. The mock
    // matches on body_json so a wrong value would 404 → test failure.
    let server = MockServer::start().await;
    Mock::given(method("POST"))
        .and(path("/events"))
        .and(body_json(json!({
            "type": "user.created",
            "userId": "u-42",
            "priority": 50,
        })))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({
            "id": "evt-1",
            "type": "user.created",
        })))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "events",
            "create-event",
            "--type",
            "user.created",
            "--user-id",
            "u-42",
            "--priority",
            "50",
        ])
        .output()
        .unwrap();
    assert_ok(&output);
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("evt-1"), "response id should appear: {stdout}");
}

#[tokio::test]
async fn test_const_value_auto_injected_when_flag_omitted() {
    // The spec marks `type` as required AND const: user.created. Because
    // there's only one valid value, the CLI lowers it as an optional flag
    // with the const installed as a client-side default — omitting --type
    // must still produce `type: user.created` on the wire.
    let server = MockServer::start().await;
    Mock::given(method("POST"))
        .and(path("/events"))
        .and(body_json(json!({
            "type": "user.created",
            "priority": 10,
        })))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"id": "evt-auto"})))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["events", "create-event", "--priority", "10"])
        .output()
        .unwrap();
    assert_ok(&output);
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("evt-auto"), "response id should appear: {stdout}");
}

#[tokio::test]
async fn test_const_rejects_non_const_value_before_any_wire_call() {
    // A value other than the const must be rejected by clap's value_parser,
    // before the CLI builds any HTTP request. The mock asserts `expect(0)`:
    // if any call reaches it, the test fails.
    let server = MockServer::start().await;
    Mock::given(method("POST"))
        .and(path("/events"))
        .respond_with(ResponseTemplate::new(500))
        .expect(0)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["events", "create-event", "--type", "user.deleted"])
        .output()
        .unwrap();
    assert!(!output.status.success(), "non-const value must fail validation");
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("invalid value 'user.deleted'") && stderr.contains("user.created"),
        "stderr should name the rejected value and the allowed const: {stderr}",
    );
}

// ---------------------------------------------------------------------------
// 3.1 nullability via `type: [..., "null"]`
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_nullable_field_omitted_when_flag_not_passed() {
    // userId is `type: ["string", "null"]` and not in `required:`, so the
    // CLI flag is optional. Omitting it must produce a request body without
    // a `userId` key (not `userId: null`, just absent).
    let server = MockServer::start().await;
    Mock::given(method("POST"))
        .and(path("/events"))
        .and(body_json(json!({
            "type": "user.created",
            "priority": 10,
        })))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"id": "evt-2"})))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "events",
            "create-event",
            "--type",
            "user.created",
            "--priority",
            "10",
        ])
        .output()
        .unwrap();
    assert_ok(&output);
}

#[tokio::test]
async fn test_nullable_field_sent_when_flag_passed() {
    let server = MockServer::start().await;
    Mock::given(method("POST"))
        .and(path("/events"))
        .and(body_json(json!({
            "type": "user.created",
            "userId": "alice",
            "priority": 99,
        })))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"id": "evt-3"})))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "events",
            "create-event",
            "--type",
            "user.created",
            "--user-id",
            "alice",
            "--priority",
            "99",
        ])
        .output()
        .unwrap();
    assert_ok(&output);
}

#[tokio::test]
async fn test_nullable_field_sent_as_json_null_via_null_sentinel() {
    // `--user-id null` on a nullable scalar (`type: ["string", "null"]`)
    // serializes to JSON null on the wire. The mock uses body_json, so a
    // request with the literal string "null" instead of JSON null would
    // 404 → test failure.
    let server = MockServer::start().await;
    Mock::given(method("POST"))
        .and(path("/events"))
        .and(body_json(json!({
            "type": "user.created",
            "userId": null,
            "priority": 7,
        })))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"id": "evt-null"})))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "events",
            "create-event",
            "--type",
            "user.created",
            "--user-id",
            "null",
            "--priority",
            "7",
        ])
        .output()
        .unwrap();
    assert_ok(&output);
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("evt-null"), "response id should appear: {stdout}");
}

#[tokio::test]
async fn test_nullable_field_help_advertises_null_sentinel_in_value_name() {
    // --help for createEvent must render `--user-id <STRING|null>` so users
    // discover the sentinel from the usage line.
    let output = fixture_cmd()
        .args(["events", "create-event", "--help"])
        .output()
        .unwrap();
    assert_ok(&output);
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("STRING|null"),
        "nullable userId must render as STRING|null in --help: {stdout}",
    );
}

#[tokio::test]
async fn test_nullable_response_field_renders_as_null() {
    // GET /users/{userId} where the stub returns `email: null` (3.1
    // nullable field). The CLI should print the null as JSON `null`, not
    // crash on the null-typed field. Proves the IR's `nullable: true` for
    // 3.1 type-array forms reaches the executor without information loss.
    let server = MockServer::start().await;
    Mock::given(method("GET"))
        .and(path("/users/u-7"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({
            "id": "u-7",
            "email": null,
            "role": "admin",
        })))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["users", "get-user", "--user-id", "u-7"])
        .output()
        .unwrap();
    assert_ok(&output);
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("\"email\": null"), "null email should render: {stdout}");
    assert!(stdout.contains("u-7"), "id should render: {stdout}");
}

// ---------------------------------------------------------------------------
// Numeric exclusive bounds (3.1 numeric form)
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_exclusive_bound_integer_round_trips_on_wire() {
    // priority has 3.1 numeric exclusiveMinimum:0 / exclusiveMaximum:100.
    // The CLI doesn't enforce the bounds today (parse-only capture), but
    // the value must serialize as a JSON number, not as a string, on the
    // outgoing body. body_json matches on JSON equality so a string
    // representation would cause a 404 / test failure.
    let server = MockServer::start().await;
    Mock::given(method("POST"))
        .and(path("/events"))
        .and(body_json(json!({
            "type": "user.created",
            "priority": 42,
        })))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"id": "evt-4"})))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "events",
            "create-event",
            "--type",
            "user.created",
            "--priority",
            "42",
        ])
        .output()
        .unwrap();
    assert_ok(&output);
}

// ---------------------------------------------------------------------------
// Webhooks: parsed but NOT exposed as CLI subcommands
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_webhook_operation_is_not_a_subcommand() {
    // The spec declares a `userDeleted` webhook whose operationId is
    // `handleUserDeleted`. It must NOT appear as a CLI subcommand because
    // webhooks are inbound. Trying to invoke it should produce a clap
    // "unrecognized subcommand" error before any HTTP call is attempted.
    let server = MockServer::start().await;
    Mock::given(method("POST"))
        .respond_with(ResponseTemplate::new(500))
        .expect(0)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["events", "handle-user-deleted"])
        .output()
        .unwrap();
    assert!(!output.status.success(), "webhook ops must not be invokable");

    // Also assert it doesn't appear under any group: a top-level help dump
    // should not mention the webhook operationId.
    let help_output = fixture_cmd()
        .args(["--help"])
        .output()
        .unwrap();
    let help_stdout = String::from_utf8_lossy(&help_output.stdout);
    assert!(
        !help_stdout.contains("handle-user-deleted")
            && !help_stdout.contains("handleUserDeleted")
            && !help_stdout.contains("userDeleted"),
        "webhook should not appear in top-level help: {help_stdout}",
    );
}
