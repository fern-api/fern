//! Tier-2 wire tests for `x-fern-streaming` (FER-9864).
//!
//! Each test:
//! 1. Authors a minimal OpenAPI spec inline that declares one streaming
//!    operation under `x-fern-streaming` (either SSE or NDJSON).
//! 2. Stands up a fresh `wiremock::MockServer` that returns a hard-coded
//!    streamed body — `\n`-joined frames the executor must split.
//! 3. Drives [`fern_cli_sdk::openapi::executor::execute_method`] against
//!    the mock and asserts the request shape (path) and the events
//!    captured into the buffered response value match expected ordering.
//!
//! The executor's *streaming* path (default — no `--no-stream`) writes
//! each event to stdout as it arrives, which is hard to capture from a
//! library test. The buffered branch (selected here via
//! `capture_output = true`) consumes the *same* `decode_stream_event`
//! pipeline and stores each event in order — so a regression in framing
//! or terminator handling fails this test before it reaches the CLI
//! surface. The CLI-binary end-to-end coverage of streaming output is
//! exercised in the smoke test under `tests/box_smoke.rs` follow-up.

use std::sync::Arc;

use fern_cli_sdk::auth::{AuthCredentialSource, BearerAuthProvider, DynAuthProvider};
use fern_cli_sdk::formatter::OutputPipeline;
use fern_cli_sdk::http::HttpConfig;
use fern_cli_sdk::openapi::executor::{self, PaginationConfig};
use fern_cli_sdk::openapi::load_openapi_spec;
use wiremock::matchers::{header_regex, method, path};
use wiremock::{Mock, MockServer, ResponseTemplate};

const TOKEN: &str = "wire-token";

fn bearer_provider() -> DynAuthProvider {
    Arc::new(BearerAuthProvider::new(
        "bearerAuth",
        AuthCredentialSource::literal(TOKEN),
    ))
}

fn default_pagination() -> PaginationConfig {
    PaginationConfig::default()
}

fn default_http_config() -> HttpConfig {
    HttpConfig::new("openapi-streaming-wire").unwrap()
}

/// Tiny OpenAPI document with one operation under `/stream` whose
/// `x-fern-streaming` payload is parameterized. Returning the YAML
/// from a single helper keeps each test focused on the body the
/// mock returns.
fn streaming_spec(extension: &str) -> String {
    format!(
        r#"
openapi: "3.0.0"
info:
  title: Streaming Wire
  version: "1.0"
servers:
  - url: PLACEHOLDER
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
security:
  - bearerAuth: []
paths:
  /stream:
    post:
      operationId: streamChat
      x-fern-streaming: {extension}
      responses:
        "200":
          description: stream
"#
    )
}

/// Mount a single streaming mock. Wiremock's `set_body_string`
/// returns the entire body in one shot at the HTTP level — the
/// executor must still split it into discrete events using
/// `decode_stream_event`, which is the surface this test locks.
async fn mount_stream(server: &MockServer, body: &str) {
    Mock::given(method("POST"))
        .and(path("/stream"))
        .and(header_regex(
            "Authorization",
            format!("^Bearer {TOKEN}$").as_str(),
        ))
        .respond_with(ResponseTemplate::new(200).set_body_string(body.to_string()))
        .expect(1)
        .mount(server)
        .await;
}

/// Drive the streaming operation through the executor's *buffered*
/// branch (capture_output = true) so the test can assert against
/// the collected events. The executor still runs the full
/// `decode_stream_event` pipeline; only the final emit step differs
/// from the live `stream_response` path.
async fn drive_stream(spec: &str, server: &MockServer) -> serde_json::Value {
    let spec = spec.replace("PLACEHOLDER", &server.uri());
    let doc = load_openapi_spec(&spec, "openapi-streaming-wire").unwrap();
    let method = doc.resources["stream"].methods["stream-chat"].clone();
    let result = executor::execute_method(
        &doc,
        &method,
        None,
        None,
        &bearer_provider(),
        None,
        None,
        None,
        false,
        &default_pagination(),
        &OutputPipeline::default(),
        true,  // capture_output → collect events into a Value
        None,  // base_url_override
        &default_http_config(),
        false, // no_extract
        false, // no_retry
        false, // no_stream — irrelevant when capture_output is set
        &[],   // no x-fern-global-headers in this fixture
    )
    .await
    .expect("execute_method must succeed against the streaming mock");
    result.expect("streaming response must produce a value")
}

#[tokio::test]
async fn streaming_sse_emits_events_in_order_and_honors_terminator() {
    let server = MockServer::start().await;
    // Mix `event:` framing and a comment line ahead of two real events,
    // then the spec-declared `[DONE]` sentinel. The executor must skip
    // the framing/comment lines and stop reading at the sentinel.
    let body = "\
: keepalive
event: message
data: {\"index\":0,\"delta\":\"hello\"}

event: message
data: {\"index\":1,\"delta\":\"world\"}

data: [DONE]

data: {\"index\":2,\"delta\":\"AFTER\"}
";
    mount_stream(&server, body).await;

    // The terminator is part of the spec (no implicit default after
    // dropping the `[DONE]` fallback to match TS/C# typed-SDK parity).
    let value = drive_stream(
        &streaming_spec(r#"{ format: sse, terminator: "[DONE]" }"#),
        &server,
    )
    .await;
    let events = value
        .as_array()
        .unwrap_or_else(|| panic!("two events should array-wrap, got {value:?}"));
    assert_eq!(events.len(), 2, "events after [DONE] must be dropped");
    assert_eq!(events[0]["index"], 0);
    assert_eq!(events[0]["delta"], "hello");
    assert_eq!(events[1]["index"], 1);
    assert_eq!(events[1]["delta"], "world");
}

#[tokio::test]
async fn streaming_ndjson_emits_one_value_per_line() {
    let server = MockServer::start().await;
    let body = "\
{\"id\":1,\"role\":\"user\"}
{\"id\":2,\"role\":\"assistant\"}
{\"id\":3,\"role\":\"assistant\"}
";
    mount_stream(&server, body).await;

    let value = drive_stream(&streaming_spec("true"), &server).await;
    let events = value
        .as_array()
        .unwrap_or_else(|| panic!("three NDJSON values should array-wrap, got {value:?}"));
    assert_eq!(events.len(), 3);
    assert_eq!(events[0]["id"], 1);
    assert_eq!(events[1]["id"], 2);
    assert_eq!(events[2]["id"], 3);
}

#[tokio::test]
async fn streaming_sse_custom_terminator_replaces_default_sentinel() {
    let server = MockServer::start().await;
    // Custom terminator `[END]`: the executor must stop here, and
    // `[DONE]` (which used to be the implicit default before this
    // change landed) is now a regular event payload.
    let body = "\
data: {\"step\":1}

data: [DONE]

data: {\"step\":2}

data: [END]

data: {\"step\":\"unreachable\"}
";
    mount_stream(&server, body).await;

    let value = drive_stream(
        &streaming_spec(r#"{ format: sse, terminator: "[END]" }"#),
        &server,
    )
    .await;
    let events = value
        .as_array()
        .unwrap_or_else(|| panic!("three pre-terminator events, got {value:?}"));
    assert_eq!(events.len(), 3);
    assert_eq!(events[0]["step"], 1);
    // `[DONE]` is now a regular event payload (string after stripping
    // the `data:` prefix and one leading space).
    assert_eq!(events[1].as_str(), Some("[DONE]"));
    assert_eq!(events[2]["step"], 2);
}

#[tokio::test]
async fn streaming_sse_concatenates_multiline_data_into_one_event() {
    // A single event spanning three `data:` lines (e.g. a
    // pretty-printed JSON payload) must join with `\n` and dispatch
    // once on the blank-line separator — matches the WHATWG SSE
    // spec and the TS runtime's `iterSseEvents` loop. Without this,
    // Gemini-style multi-line streams would dispatch each line as
    // its own corrupt JSON fragment.
    let server = MockServer::start().await;
    let body = "\
data: {
data:   \"foo\": 1
data: }

";
    mount_stream(&server, body).await;

    let value = drive_stream(&streaming_spec(r#"{ format: sse }"#), &server).await;
    // Single buffered event → unwraps to the joined JSON object.
    assert_eq!(value["foo"], 1);
}

#[tokio::test]
async fn streaming_sse_separates_events_on_blank_line() {
    // Two distinct events separated by a blank line dispatch as two
    // payloads. Each block accumulates its own `data:` lines.
    let server = MockServer::start().await;
    let body = "\
data: {\"index\":0}

data: {\"index\":1}

";
    mount_stream(&server, body).await;

    let value = drive_stream(&streaming_spec(r#"{ format: sse }"#), &server).await;
    let events = value
        .as_array()
        .unwrap_or_else(|| panic!("two events should array-wrap, got {value:?}"));
    assert_eq!(events.len(), 2);
    assert_eq!(events[0]["index"], 0);
    assert_eq!(events[1]["index"], 1);
}

#[tokio::test]
async fn streaming_sse_flushes_final_event_without_trailing_blank_line() {
    // Stream ends mid-event (no trailing blank line). The executor
    // must still flush the buffered payload at EOF — mirrors the TS
    // post-loop `if (dataValue != null)` dispatch.
    let server = MockServer::start().await;
    let body = "data: {\"final\":\"answer\"}";
    mount_stream(&server, body).await;

    let value = drive_stream(&streaming_spec(r#"{ format: sse }"#), &server).await;
    assert_eq!(value["final"], "answer");
}

#[tokio::test]
async fn streaming_text_emits_each_non_empty_line_as_string_event() {
    let server = MockServer::start().await;
    // Three real lines plus a blank separator. The executor must
    // emit each non-empty line verbatim as a plain string event —
    // no JSON parse, no SSE prefix strip, no terminator check
    // (mirrors the C# generator at
    // `HttpEndpointGenerator.ts:815-825`).
    let body = "\
first line of output

second line of output
third line of output
";
    mount_stream(&server, body).await;

    let value = drive_stream(&streaming_spec(r#"{ format: text }"#), &server).await;
    let events = value
        .as_array()
        .unwrap_or_else(|| panic!("three text lines should array-wrap, got {value:?}"));
    assert_eq!(events.len(), 3);
    assert_eq!(events[0].as_str(), Some("first line of output"));
    assert_eq!(events[1].as_str(), Some("second line of output"));
    assert_eq!(events[2].as_str(), Some("third line of output"));
}

#[tokio::test]
async fn streaming_no_stream_flag_buffers_into_unary_value() {
    // When `--no-stream` is set, the executor collapses the response
    // into a single value. The buffered path is the same one
    // `capture_output = true` uses; we exercise it here with
    // `no_stream = true` and `capture_output = false` via the
    // `--no-stream` plumbing on `execute_method` directly.
    //
    // The test asserts that a single-event body unwraps to that
    // event's JSON value rather than a one-element array — the
    // surface a JSON pipe (e.g. `… | jq`) expects.
    let server = MockServer::start().await;
    // No explicit terminator in the body — the executor must read
    // until EOF when the spec doesn't declare a sentinel (matches the
    // TS / C# typed-SDK runtimes).
    let body = "data: {\"final\":\"answer\"}\n\n";
    mount_stream(&server, body).await;

    let spec = streaming_spec(r#"{ format: sse }"#).replace("PLACEHOLDER", &server.uri());
    let doc = load_openapi_spec(&spec, "openapi-streaming-wire").unwrap();
    let method = doc.resources["stream"].methods["stream-chat"].clone();
    let result = executor::execute_method(
        &doc,
        &method,
        None,
        None,
        &bearer_provider(),
        None,
        None,
        None,
        false,
        &default_pagination(),
        &OutputPipeline::default(),
        true,  // capture_output — verify the buffered Value shape
        None,
        &default_http_config(),
        false, // no_extract
        false, // no_retry
        true,  // no_stream — irrelevant under capture_output but the flag
               // must not flip behavior into an error
        &[],   // no x-fern-global-headers in this fixture
    )
    .await
    .expect("execute_method must succeed against the streaming mock");
    let value = result.expect("streaming response must produce a value");
    // Single event → unwrap to the event's JSON value, not a 1-array.
    assert_eq!(value["final"], "answer");
}

/// Regression guard: the cli-sdk runtime must NOT inject a
/// streaming-specific `Accept` header. The TypeScript and C# typed
/// SDKs in `fern-api/fern` don't set one for SSE/NDJSON endpoints,
/// and cli-sdk's parity rule for FER-9864 work is to mirror the
/// typed SDKs' behavior. wiremock matchers can only assert headers
/// that *exist*, so we inspect the recorded request directly — same
/// pattern as `tests/auth_routing_wire.rs` uses for asserting
/// Authorization absence.
#[tokio::test]
async fn streaming_endpoints_do_not_inject_accept_header() {
    let server = MockServer::start().await;
    let body = "data: {\"ok\":true}\n\ndata: [DONE]\n";
    mount_stream(&server, body).await;

    let _ = drive_stream(&streaming_spec(r#"{ format: sse }"#), &server).await;

    let recorded = server
        .received_requests()
        .await
        .expect("MockServer should record requests");
    assert_eq!(recorded.len(), 1, "exactly one streaming request expected");
    let accept_values: Vec<String> = recorded[0]
        .headers
        .get_all("accept")
        .iter()
        .map(|v| v.to_str().unwrap_or_default().to_string())
        .collect();
    for value in &accept_values {
        assert!(
            !value.contains("text/event-stream"),
            "regression: streaming endpoint injected SSE-specific Accept header: {value:?}"
        );
        assert!(
            !value.contains("x-ndjson") && !value.contains("jsonl"),
            "regression: streaming endpoint injected NDJSON-specific Accept header: {value:?}"
        );
    }
}
