// SPDX-License-Identifier: Apache-2.0
//
// Integration tests for `fern_cli_sdk::websocket`.
//
// Each test spawns an in-process WS server on `127.0.0.1:0` (ephemeral
// port), drives a `WebSocketClient` against it, and asserts on the
// mock's view of what the client did + on the client's return value.
//
// Tests deliberately avoid asserting on stdout content. The transforms
// applied to each frame before emit (autoresponder elision, audio-key
// stripping, JSON parsing) are unit-tested in `src/websocket/client.rs`;
// the wire tests cover the loop wiring and the failure-mode matrix.

use std::time::Duration;

use futures_util::{SinkExt, StreamExt};
use serde_json::{json, Value};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;
use tokio_tungstenite::tungstenite::{self, Message};

use fern_cli_sdk::auth::AuthCredentialSource;
use fern_cli_sdk::error::CliError;
use fern_cli_sdk::http::HttpConfig;
use fern_cli_sdk::websocket::{AutoResponder, WebSocketClient, WsAuth, WsConfig};

/// Test-local ping/pong autoresponder.
/// Matches `{"type":"ping","ping_event":{"event_id":<int>}}` and replies
/// with `{"type":"pong","event_id":<same int>}`.
fn test_ping_pong_responder() -> AutoResponder {
    std::sync::Arc::new(|frame: &Value| -> Option<Value> {
        if frame.get("type").and_then(|v| v.as_str()) != Some("ping") {
            return None;
        }
        frame
            .pointer("/ping_event/event_id")
            .and_then(|v| v.as_i64())
            .map(|event_id| json!({"type": "pong", "event_id": event_id}))
    })
}

// -----------------------------------------------------------------------------
// Mock-server helpers
// -----------------------------------------------------------------------------

/// Bind a TCP listener on `127.0.0.1:0`. Returns the bound port so tests
/// can build the `ws://127.0.0.1:<port>/` URL without racing on a
/// hardcoded port.
async fn bind_ephemeral() -> (TcpListener, u16) {
    let listener = TcpListener::bind("127.0.0.1:0").await.expect("bind");
    let port = listener.local_addr().expect("addr").port();
    (listener, port)
}

/// Accept one upgrade and hand the connected server-side stream to
/// `handler`. Returns the handler's join handle so the test can await
/// the server-side side of the conversation.
fn spawn_one_shot_ws<F, Fut>(
    listener: TcpListener,
    handler: F,
) -> tokio::task::JoinHandle<()>
where
    F: FnOnce(
            tokio_tungstenite::WebSocketStream<tokio::net::TcpStream>,
        ) -> Fut
        + Send
        + 'static,
    Fut: std::future::Future<Output = ()> + Send + 'static,
{
    tokio::spawn(async move {
        let (stream, _) = listener.accept().await.expect("accept");
        let ws = tokio_tungstenite::accept_async(stream)
            .await
            .expect("ws handshake");
        handler(ws).await;
    })
}

/// Standard HttpConfig for tests (no env-var overrides honored anyway).
fn test_http_config() -> HttpConfig {
    HttpConfig::new("ws-wire-test").unwrap()
}

// -----------------------------------------------------------------------------
// 1. Handshake succeeds against a vanilla accept_async.
// -----------------------------------------------------------------------------

#[tokio::test]
async fn handshake_succeeds() {
    let (listener, port) = bind_ephemeral().await;
    let server = spawn_one_shot_ws(listener, |mut ws| async move {
        // Server side: send a normal Close(1000) immediately so the
        // client returns Ok. Reading the eventual client-side Close
        // keeps both sides in lockstep.
        ws.send(Message::Close(Some(tungstenite::protocol::CloseFrame {
            code: tungstenite::protocol::frame::coding::CloseCode::Normal,
            reason: "".into(),
        })))
        .await
        .ok();
        // Drain anything the client sends after seeing the close
        while ws.next().await.is_some() {}
    });

    let cfg = WsConfig::new(format!("ws://127.0.0.1:{port}/"));
    let client = WebSocketClient::connect(cfg, &test_http_config())
        .await
        .expect("handshake should succeed");

    let (shutdown_tx, shutdown_rx) = tokio::sync::oneshot::channel::<()>();
    let shutdown = Box::pin(async move {
        let _ = shutdown_rx.await;
    });
    let result = client.run_until_shutdown(shutdown).await;
    drop(shutdown_tx);
    server.await.ok();

    // Server-side normal close → Ok per matrix.
    assert!(result.is_ok(), "expected clean exit, got: {result:?}");
}

// -----------------------------------------------------------------------------
// 2. Three inbound frames flow through the client without error.
// -----------------------------------------------------------------------------

#[tokio::test]
async fn round_trips_three_frames() {
    let (listener, port) = bind_ephemeral().await;
    let server = spawn_one_shot_ws(listener, |mut ws| async move {
        for i in 1..=3 {
            ws.send(Message::Text(json!({"n": i}).to_string()))
                .await
                .ok();
        }
        ws.send(Message::Close(Some(tungstenite::protocol::CloseFrame {
            code: tungstenite::protocol::frame::coding::CloseCode::Normal,
            reason: "".into(),
        })))
        .await
        .ok();
        while ws.next().await.is_some() {}
    });

    let cfg = WsConfig::new(format!("ws://127.0.0.1:{port}/"));
    let client = WebSocketClient::connect(cfg, &test_http_config())
        .await
        .unwrap();
    let shutdown = Box::pin(std::future::pending::<()>());
    let result = client.run_until_shutdown(shutdown).await;
    server.await.ok();

    assert!(result.is_ok(), "expected clean exit, got: {result:?}");
}

// -----------------------------------------------------------------------------
// 3. Server-initiated Close(1000) mid-stream → Ok(()).
// -----------------------------------------------------------------------------

#[tokio::test]
async fn close_1000_mid_stream_exits_zero() {
    let (listener, port) = bind_ephemeral().await;
    let server = spawn_one_shot_ws(listener, |mut ws| async move {
        ws.send(Message::Text(json!({"hi": true}).to_string()))
            .await
            .ok();
        ws.send(Message::Close(Some(tungstenite::protocol::CloseFrame {
            code: tungstenite::protocol::frame::coding::CloseCode::Normal,
            reason: "done".into(),
        })))
        .await
        .ok();
        while ws.next().await.is_some() {}
    });

    let cfg = WsConfig::new(format!("ws://127.0.0.1:{port}/"));
    let client = WebSocketClient::connect(cfg, &test_http_config())
        .await
        .unwrap();
    let shutdown = Box::pin(std::future::pending::<()>());
    let result = client.run_until_shutdown(shutdown).await;
    server.await.ok();

    assert!(matches!(result, Ok(())), "expected Ok(()), got: {result:?}");
}

// -----------------------------------------------------------------------------
// 4. Server-initiated abnormal close → CliError::Other with the hint.
// -----------------------------------------------------------------------------

#[tokio::test]
async fn close_abnormal_maps_to_other_with_hint() {
    let (listener, port) = bind_ephemeral().await;
    let server = spawn_one_shot_ws(listener, |mut ws| async move {
        // CloseCode::Error is the named variant for 1011 (Internal Error).
        ws.send(Message::Close(Some(tungstenite::protocol::CloseFrame {
            code: tungstenite::protocol::frame::coding::CloseCode::Error,
            reason: "server error".into(),
        })))
        .await
        .ok();
        while ws.next().await.is_some() {}
    });

    let cfg = WsConfig::new(format!("ws://127.0.0.1:{port}/"));
    let client = WebSocketClient::connect(cfg, &test_http_config())
        .await
        .unwrap();
    let shutdown = Box::pin(std::future::pending::<()>());
    let result = client.run_until_shutdown(shutdown).await;
    server.await.ok();

    let err = match result {
        Err(e) => e,
        Ok(_) => panic!("abnormal close should be an error"),
    };
    assert!(matches!(err, CliError::Other(_)));
    let msg = err.to_string();
    assert!(msg.contains("1011"), "missing close code: {msg}");
    // Default `WsConfig::new` is API-neutral; per-API constructors weave
    // their own hint (covered by `custom_abnormal_close_hint_appears_in_error`).
    assert!(
        msg.contains("keepalive") || msg.contains("auth"),
        "default hint should mention auth or keepalive: {msg}",
    );
    // Exit code per matrix: Other = 5.
    assert_eq!(err.exit_code(), 5);
}

// -----------------------------------------------------------------------------
// 5. Shutdown future fires mid-stream → client sends Close(1000), exits Ok.
// -----------------------------------------------------------------------------

#[tokio::test]
async fn shutdown_future_sends_close_and_exits_zero() {
    let (listener, port) = bind_ephemeral().await;
    // Channel from server back to test, to confirm the close frame arrived.
    let (close_tx, close_rx) = tokio::sync::oneshot::channel::<u16>();
    let server = spawn_one_shot_ws(listener, |mut ws| async move {
        let mut close_seen: Option<u16> = None;
        // Just listen; the test triggers shutdown on the client side.
        while let Some(msg) = ws.next().await {
            match msg {
                Ok(Message::Close(frame)) => {
                    close_seen = frame.as_ref().map(|f| u16::from(f.code));
                    break;
                }
                Ok(_) => continue,
                Err(_) => break,
            }
        }
        close_tx.send(close_seen.unwrap_or(0)).ok();
    });

    let cfg = WsConfig::new(format!("ws://127.0.0.1:{port}/"));
    let client = WebSocketClient::connect(cfg, &test_http_config())
        .await
        .unwrap();

    let (trigger_tx, trigger_rx) = tokio::sync::oneshot::channel::<()>();
    let shutdown = Box::pin(async move {
        let _ = trigger_rx.await;
    });
    let client_task = tokio::spawn(client.run_until_shutdown(shutdown));

    // Give the connection a moment to establish, then trigger.
    tokio::time::sleep(Duration::from_millis(50)).await;
    trigger_tx.send(()).unwrap();

    let result = client_task.await.expect("join");
    server.await.ok();

    assert!(matches!(result, Ok(())), "expected Ok, got: {result:?}");
    let code = tokio::time::timeout(Duration::from_secs(2), close_rx)
        .await
        .expect("close-frame channel timeout")
        .expect("close-frame channel closed");
    assert_eq!(code, 1000, "client should send Normal Closure on shutdown");
}

// -----------------------------------------------------------------------------
// 6. Bad URL → CliError::Validation, exit 3.
// -----------------------------------------------------------------------------

#[tokio::test]
async fn bad_url_maps_to_validation_error() {
    let cfg = WsConfig::new("not a url");
    // `WebSocketClient` doesn't implement Debug (it holds a stream that
    // doesn't), so use match instead of expect_err.
    let err = match WebSocketClient::connect(cfg, &test_http_config()).await {
        Err(e) => e,
        Ok(_) => panic!("invalid URL should error"),
    };
    assert!(matches!(err, CliError::Validation(_)), "got: {err:?}");
    assert_eq!(err.exit_code(), 3);
}

// -----------------------------------------------------------------------------
// 7. Autoresponder elides ping + sends matching pong.
// -----------------------------------------------------------------------------

#[tokio::test]
async fn auto_responder_elides_ping_and_sends_pong() {
    let (listener, port) = bind_ephemeral().await;
    let (pong_tx, pong_rx) = tokio::sync::oneshot::channel::<Value>();
    let server = spawn_one_shot_ws(listener, |mut ws| async move {
        // Send an app-level ping frame.
        ws.send(Message::Text(
            json!({"type": "ping", "ping_event": {"event_id": 42, "ping_ms": 50}})
                .to_string(),
        ))
        .await
        .ok();

        // Wait for the pong.
        if let Some(Ok(Message::Text(reply))) = ws.next().await {
            let v: Value = serde_json::from_str(&reply).unwrap();
            pong_tx.send(v).ok();
        }

        // Clean close.
        ws.send(Message::Close(Some(tungstenite::protocol::CloseFrame {
            code: tungstenite::protocol::frame::coding::CloseCode::Normal,
            reason: "".into(),
        })))
        .await
        .ok();
        while ws.next().await.is_some() {}
    });

    let mut cfg = WsConfig::new(format!("ws://127.0.0.1:{port}/"));
    cfg.auto_responder = Some(test_ping_pong_responder());
    let client = WebSocketClient::connect(cfg, &test_http_config())
        .await
        .unwrap();
    let shutdown = Box::pin(std::future::pending::<()>());
    let result = client.run_until_shutdown(shutdown).await;
    server.await.ok();

    assert!(result.is_ok(), "expected Ok, got: {result:?}");
    let pong = tokio::time::timeout(Duration::from_secs(2), pong_rx)
        .await
        .expect("pong-channel timeout")
        .expect("pong-channel closed");
    assert_eq!(pong, json!({"type": "pong", "event_id": 42}));
}

// -----------------------------------------------------------------------------
// 8. First-message auth: WsAuth::FirstMessage merges field into first send.
// -----------------------------------------------------------------------------

#[tokio::test]
async fn first_message_auth_field_injected() {
    let (listener, port) = bind_ephemeral().await;
    let (first_msg_tx, first_msg_rx) = tokio::sync::oneshot::channel::<Value>();
    let server = spawn_one_shot_ws(listener, |mut ws| async move {
        if let Some(Ok(Message::Text(text))) = ws.next().await {
            let v: Value = serde_json::from_str(&text).unwrap();
            first_msg_tx.send(v).ok();
        }
        ws.send(Message::Close(Some(tungstenite::protocol::CloseFrame {
            code: tungstenite::protocol::frame::coding::CloseCode::Normal,
            reason: "".into(),
        })))
        .await
        .ok();
        while ws.next().await.is_some() {}
    });

    let mut cfg = WsConfig::new(format!("ws://127.0.0.1:{port}/"));
    cfg.auth = WsAuth::FirstMessage(
        "xi_api_key".into(),
        AuthCredentialSource::literal("sk-test-merged"),
    );
    let mut client = WebSocketClient::connect(cfg, &test_http_config())
        .await
        .unwrap();
    client
        .send(&json!({"text": "hello", "voice_settings": {"stability": 0.5}}))
        .await
        .unwrap();
    let shutdown = Box::pin(std::future::pending::<()>());
    let result = client.run_until_shutdown(shutdown).await;
    server.await.ok();

    assert!(result.is_ok());
    let first = tokio::time::timeout(Duration::from_secs(2), first_msg_rx)
        .await
        .expect("first-msg timeout")
        .expect("first-msg channel closed");
    assert_eq!(first["xi_api_key"], "sk-test-merged");
    assert_eq!(first["text"], "hello");
    assert_eq!(first["voice_settings"]["stability"], 0.5);
}

// -----------------------------------------------------------------------------
// 9. Header auth: WsAuth::Header puts the value on the handshake.
// -----------------------------------------------------------------------------

#[tokio::test]
async fn header_auth_sent_on_handshake() {
    let (listener, port) = bind_ephemeral().await;
    let (hdr_tx, hdr_rx) = tokio::sync::oneshot::channel::<Option<String>>();
    let server = tokio::spawn(async move {
        let (stream, _) = listener.accept().await.expect("accept");
        let captured: std::sync::Arc<std::sync::Mutex<Option<String>>> =
            std::sync::Arc::new(std::sync::Mutex::new(None));
        let captured_clone = captured.clone();
        let cb = move |req: &tungstenite::handshake::server::Request,
                       resp: tungstenite::handshake::server::Response| {
            if let Some(v) = req.headers().get("xi-api-key") {
                *captured_clone.lock().unwrap() =
                    Some(v.to_str().unwrap_or("").to_string());
            }
            Ok(resp)
        };
        let ws = tokio_tungstenite::accept_hdr_async(stream, cb)
            .await
            .expect("ws handshake");
        // Send a clean close so the client returns Ok.
        let mut ws = ws;
        ws.send(Message::Close(Some(tungstenite::protocol::CloseFrame {
            code: tungstenite::protocol::frame::coding::CloseCode::Normal,
            reason: "".into(),
        })))
        .await
        .ok();
        while ws.next().await.is_some() {}
        let final_val = captured.lock().unwrap().clone();
        hdr_tx.send(final_val).ok();
    });

    let mut cfg = WsConfig::new(format!("ws://127.0.0.1:{port}/"));
    cfg.auth = WsAuth::Header(
        "xi-api-key".into(),
        AuthCredentialSource::literal("sk-header-test"),
    );
    let client = WebSocketClient::connect(cfg, &test_http_config())
        .await
        .unwrap();
    let shutdown = Box::pin(std::future::pending::<()>());
    let _ = client.run_until_shutdown(shutdown).await;
    server.await.ok();

    let observed = tokio::time::timeout(Duration::from_secs(2), hdr_rx)
        .await
        .expect("header-channel timeout")
        .expect("header-channel closed");
    assert_eq!(observed.as_deref(), Some("sk-header-test"));
}

// -----------------------------------------------------------------------------
// 10. Multi-frame conversation: ping/text/ping/text/close. Asserts the
//     autoresponder elides only the ping frames, the client emits the
//     other frames, and pongs come back with matching event_ids.
// -----------------------------------------------------------------------------

#[tokio::test]
async fn auto_responder_interleaved_with_data_frames() {
    let (listener, port) = bind_ephemeral().await;
    // Collect every pong from the client. We expect exactly two, with
    // event_ids 100 and 200 in order.
    let (pong_tx, mut pong_rx) = tokio::sync::mpsc::channel::<Value>(4);
    let server = spawn_one_shot_ws(listener, |mut ws| async move {
        // Frame 1: ping (should be auto-handled, NOT emitted).
        ws.send(Message::Text(
            json!({"type": "ping", "ping_event": {"event_id": 100, "ping_ms": 50}})
                .to_string(),
        ))
        .await
        .ok();
        // Frame 2: data (should flow to OutputPipeline::emit).
        ws.send(Message::Text(
            json!({"type": "agent_response", "text": "hello world"}).to_string(),
        ))
        .await
        .ok();
        // Wait for first pong, then send second ping.
        if let Some(Ok(Message::Text(reply))) = ws.next().await {
            let v: Value = serde_json::from_str(&reply).unwrap();
            pong_tx.send(v).await.ok();
        }
        ws.send(Message::Text(
            json!({"type": "ping", "ping_event": {"event_id": 200, "ping_ms": 50}})
                .to_string(),
        ))
        .await
        .ok();
        if let Some(Ok(Message::Text(reply))) = ws.next().await {
            let v: Value = serde_json::from_str(&reply).unwrap();
            pong_tx.send(v).await.ok();
        }
        ws.send(Message::Close(Some(tungstenite::protocol::CloseFrame {
            code: tungstenite::protocol::frame::coding::CloseCode::Normal,
            reason: "".into(),
        })))
        .await
        .ok();
        while ws.next().await.is_some() {}
    });

    let mut cfg = WsConfig::new(format!("ws://127.0.0.1:{port}/"));
    cfg.auto_responder = Some(test_ping_pong_responder());
    let client = WebSocketClient::connect(cfg, &test_http_config())
        .await
        .unwrap();
    let shutdown = Box::pin(std::future::pending::<()>());
    let result = client.run_until_shutdown(shutdown).await;
    server.await.ok();

    assert!(result.is_ok(), "expected Ok, got: {result:?}");
    let first = tokio::time::timeout(Duration::from_secs(2), pong_rx.recv())
        .await
        .expect("first pong timeout")
        .expect("first pong channel closed");
    let second = tokio::time::timeout(Duration::from_secs(2), pong_rx.recv())
        .await
        .expect("second pong timeout")
        .expect("second pong channel closed");
    assert_eq!(first, json!({"type": "pong", "event_id": 100}));
    assert_eq!(second, json!({"type": "pong", "event_id": 200}));
}

// -----------------------------------------------------------------------------
// Raw-TCP helper for handshake-status tests: read the HTTP upgrade request
// (until we see the blank-line terminator) and write a fixed HTTP response.
// Lets us simulate 401 / 404 / 503 / etc. on the upgrade without involving
// `accept_async` (which would force a real WS handshake).
// -----------------------------------------------------------------------------

async fn answer_with_http_status(
    listener: TcpListener,
    status_line: &'static str,
    body: &'static str,
) -> tokio::task::JoinHandle<()> {
    tokio::spawn(async move {
        let (mut stream, _) = listener.accept().await.expect("accept");
        // Read until we see the blank line that terminates the request headers.
        let mut buf = Vec::with_capacity(1024);
        let mut chunk = [0u8; 256];
        loop {
            match stream.read(&mut chunk).await {
                Ok(0) => break,
                Ok(n) => {
                    buf.extend_from_slice(&chunk[..n]);
                    if buf.windows(4).any(|w| w == b"\r\n\r\n") {
                        break;
                    }
                }
                Err(_) => break,
            }
        }
        let response = format!(
            "{status_line}\r\nContent-Length: {len}\r\nConnection: close\r\n\r\n{body}",
            len = body.len(),
        );
        let _ = stream.write_all(response.as_bytes()).await;
        let _ = stream.shutdown().await;
    })
}

// -----------------------------------------------------------------------------
// 11. Handshake 401 → CliError::Auth (exit 2).
// -----------------------------------------------------------------------------

#[tokio::test]
async fn handshake_401_maps_to_auth_error() {
    let (listener, port) = bind_ephemeral().await;
    let server = answer_with_http_status(
        listener,
        "HTTP/1.1 401 Unauthorized",
        "missing api key",
    )
    .await;

    let cfg = WsConfig::new(format!("ws://127.0.0.1:{port}/"));
    let err = match WebSocketClient::connect(cfg, &test_http_config()).await {
        Err(e) => e,
        Ok(_) => panic!("401 upgrade should fail handshake"),
    };
    server.await.ok();
    assert!(matches!(err, CliError::Auth(_)), "got: {err:?}");
    assert_eq!(err.exit_code(), 2);
}

// -----------------------------------------------------------------------------
// 12. Handshake 404 → CliError::Discovery (exit 4).
// -----------------------------------------------------------------------------

#[tokio::test]
async fn handshake_404_maps_to_discovery_error() {
    let (listener, port) = bind_ephemeral().await;
    let server = answer_with_http_status(
        listener,
        "HTTP/1.1 404 Not Found",
        "no such endpoint",
    )
    .await;

    let cfg = WsConfig::new(format!("ws://127.0.0.1:{port}/"));
    let err = match WebSocketClient::connect(cfg, &test_http_config()).await {
        Err(e) => e,
        Ok(_) => panic!("404 upgrade should fail handshake"),
    };
    server.await.ok();
    assert!(matches!(err, CliError::Discovery(_)), "got: {err:?}");
    assert_eq!(err.exit_code(), 4);
}

// -----------------------------------------------------------------------------
// 13. Handshake 503 → CliError::Api (exit 1) with status code captured.
// -----------------------------------------------------------------------------

#[tokio::test]
async fn handshake_5xx_maps_to_api_error() {
    let (listener, port) = bind_ephemeral().await;
    let server = answer_with_http_status(
        listener,
        "HTTP/1.1 503 Service Unavailable",
        "upstream down",
    )
    .await;

    let cfg = WsConfig::new(format!("ws://127.0.0.1:{port}/"));
    let err = match WebSocketClient::connect(cfg, &test_http_config()).await {
        Err(e) => e,
        Ok(_) => panic!("503 upgrade should fail handshake"),
    };
    server.await.ok();
    match err {
        CliError::Api { code, .. } => {
            assert_eq!(code, 503);
        }
        other => panic!("expected Api, got: {other:?}"),
    }
}

// -----------------------------------------------------------------------------
// 14. Two-header auth: e.g. Authorization + an API-version header.
// -----------------------------------------------------------------------------

#[tokio::test]
async fn two_header_auth_emits_both_pairs() {
    let (listener, port) = bind_ephemeral().await;
    let captured: std::sync::Arc<std::sync::Mutex<Vec<(String, String)>>> =
        std::sync::Arc::new(std::sync::Mutex::new(Vec::new()));
    let captured_clone = captured.clone();
    let server = tokio::spawn(async move {
        let (stream, _) = listener.accept().await.expect("accept");
        let cb = move |req: &tungstenite::handshake::server::Request,
                       resp: tungstenite::handshake::server::Response| {
            for header in &["Authorization", "X-Api-Version"] {
                if let Some(v) = req.headers().get(*header) {
                    captured_clone.lock().unwrap().push((
                        (*header).to_string(),
                        v.to_str().unwrap_or("").to_string(),
                    ));
                }
            }
            Ok(resp)
        };
        let mut ws = tokio_tungstenite::accept_hdr_async(stream, cb)
            .await
            .expect("ws handshake");
        ws.send(Message::Close(Some(tungstenite::protocol::CloseFrame {
            code: tungstenite::protocol::frame::coding::CloseCode::Normal,
            reason: "".into(),
        })))
        .await
        .ok();
        while ws.next().await.is_some() {}
    });

    let mut cfg = WsConfig::new(format!("ws://127.0.0.1:{port}/"));
    cfg.auth = WsAuth::Headers(vec![
        (
            "Authorization".into(),
            AuthCredentialSource::literal("Bearer sk-test"),
        ),
        (
            "X-Api-Version".into(),
            AuthCredentialSource::literal("v1"),
        ),
    ]);
    let client = WebSocketClient::connect(cfg, &test_http_config())
        .await
        .unwrap();
    let shutdown = Box::pin(std::future::pending::<()>());
    let _ = client.run_until_shutdown(shutdown).await;
    server.await.ok();

    let observed = captured.lock().unwrap().clone();
    assert_eq!(observed.len(), 2, "expected both headers, got: {observed:?}");
    assert!(observed.contains(&("Authorization".to_string(), "Bearer sk-test".to_string())));
    assert!(observed.contains(&("X-Api-Version".to_string(), "v1".to_string())));
}

// -----------------------------------------------------------------------------
// 15. Close(1001) Going Away (e.g. server session-cap expiry) → Ok(()), exit 0.
// -----------------------------------------------------------------------------

#[tokio::test]
async fn close_1001_going_away_is_clean_exit() {
    let (listener, port) = bind_ephemeral().await;
    let server = spawn_one_shot_ws(listener, |mut ws| async move {
        ws.send(Message::Close(Some(tungstenite::protocol::CloseFrame {
            code: tungstenite::protocol::frame::coding::CloseCode::Away,
            reason: "session cap exceeded".into(),
        })))
        .await
        .ok();
        while ws.next().await.is_some() {}
    });

    let cfg = WsConfig::new(format!("ws://127.0.0.1:{port}/"));
    let client = WebSocketClient::connect(cfg, &test_http_config())
        .await
        .unwrap();
    let shutdown = Box::pin(std::future::pending::<()>());
    let result = client.run_until_shutdown(shutdown).await;
    server.await.ok();
    assert!(matches!(result, Ok(())),
        "1001 Going Away should be a clean exit, got: {result:?}");
}

// -----------------------------------------------------------------------------
// 16. send_binary: client emits Message::Binary frames (e.g. PCM audio
//     streaming). Mock asserts the bytes round-trip intact.
// -----------------------------------------------------------------------------

#[tokio::test]
async fn send_binary_emits_binary_frames() {
    let (listener, port) = bind_ephemeral().await;
    let (rx_tx, mut rx_rx) = tokio::sync::mpsc::channel::<Vec<u8>>(4);
    let server = spawn_one_shot_ws(listener, move |mut ws| async move {
        while let Some(msg) = ws.next().await {
            match msg {
                Ok(Message::Binary(bytes)) => {
                    if rx_tx.send(bytes).await.is_err() {
                        break;
                    }
                }
                Ok(Message::Close(_)) | Err(_) => break,
                _ => {}
            }
        }
    });

    let cfg = WsConfig::new(format!("ws://127.0.0.1:{port}/"));
    let mut client = WebSocketClient::connect(cfg, &test_http_config())
        .await
        .unwrap();
    // 16-bit PCM frames are typical; mimic with a small payload.
    client.send_binary(vec![0u8, 1, 2, 3, 0xFF, 0xFE]).await.unwrap();
    client.send_binary(vec![10, 20, 30]).await.unwrap();
    let shutdown = Box::pin(async {
        // Give the server time to drain.
        tokio::time::sleep(Duration::from_millis(100)).await;
    });
    let _ = client.run_until_shutdown(shutdown).await;
    server.await.ok();

    let frame1 = tokio::time::timeout(Duration::from_secs(2), rx_rx.recv())
        .await
        .expect("first binary frame timeout")
        .expect("rx closed");
    let frame2 = tokio::time::timeout(Duration::from_secs(2), rx_rx.recv())
        .await
        .expect("second binary frame timeout")
        .expect("rx closed");
    assert_eq!(frame1, vec![0u8, 1, 2, 3, 0xFF, 0xFE]);
    assert_eq!(frame2, vec![10u8, 20, 30]);
}

// -----------------------------------------------------------------------------
// 17. Custom abnormal_close_hint overrides the default in error messages.
// -----------------------------------------------------------------------------

#[tokio::test]
async fn custom_abnormal_close_hint_appears_in_error() {
    let (listener, port) = bind_ephemeral().await;
    let server = spawn_one_shot_ws(listener, |mut ws| async move {
        ws.send(Message::Close(Some(tungstenite::protocol::CloseFrame {
            code: tungstenite::protocol::frame::coding::CloseCode::Error,
            reason: "internal".into(),
        })))
        .await
        .ok();
        while ws.next().await.is_some() {}
    });

    let mut cfg = WsConfig::new(format!("ws://127.0.0.1:{port}/"));
    cfg.abnormal_close_hint =
        "custom hint: KeepAlive cadence + encoding".to_string();
    let client = WebSocketClient::connect(cfg, &test_http_config())
        .await
        .unwrap();
    let shutdown = Box::pin(std::future::pending::<()>());
    let result = client.run_until_shutdown(shutdown).await;
    server.await.ok();

    let err = match result {
        Err(e) => e,
        Ok(_) => panic!("abnormal close should error"),
    };
    let msg = err.to_string();
    assert!(msg.contains("custom hint"), "missing custom hint: {msg}");
    assert!(!msg.contains("ping/pong"),
        "default hint should NOT appear: {msg}");
}

// -----------------------------------------------------------------------------
// 18. Regression: if a caller invokes `client.send(&...)` before
//     `run_until_shutdown`, the `first_send_done` flag must propagate
//     into the loop so the loop doesn't re-merge or double-process
//     FirstMessage auth. Pre-fix bug: `first_send_done` was destructured
//     away on entry to the loop.
// -----------------------------------------------------------------------------

#[tokio::test]
async fn first_send_done_propagates_into_recv_loop() {
    let (listener, port) = bind_ephemeral().await;
    let (frames_tx, mut frames_rx) = tokio::sync::mpsc::channel::<Value>(4);
    let server = spawn_one_shot_ws(listener, |mut ws| async move {
        while let Some(msg) = ws.next().await {
            match msg {
                Ok(Message::Text(s)) => {
                    let v: Value = serde_json::from_str(&s).unwrap();
                    if frames_tx.send(v).await.is_err() {
                        break;
                    }
                }
                Ok(Message::Close(_)) | Err(_) => break,
                _ => {}
            }
        }
    });

    let mut cfg = WsConfig::new(format!("ws://127.0.0.1:{port}/"));
    cfg.auth = WsAuth::FirstMessage(
        "xi_api_key".into(),
        AuthCredentialSource::literal("sk-once"),
    );
    let mut client = WebSocketClient::connect(cfg, &test_http_config())
        .await
        .unwrap();
    client.send(&json!({"text": "first"})).await.unwrap();
    let shutdown = Box::pin(async {
        tokio::time::sleep(Duration::from_millis(100)).await;
    });
    let _ = client.run_until_shutdown(shutdown).await;
    server.await.ok();

    let first = tokio::time::timeout(Duration::from_secs(2), frames_rx.recv())
        .await
        .expect("first frame timeout")
        .expect("rx closed");
    assert_eq!(first["xi_api_key"], "sk-once");
    assert_eq!(first["text"], "first");
    // No additional *text* frames should appear — the loop must not
    // produce a second "first" send after the destructuring. The
    // channel closes when the server task ends (after seeing the
    // Close frame the client sends on graceful shutdown), so a `None`
    // recv is also fine; only `Some(value)` would mean the loop
    // synthesised an unexpected text frame.
    match tokio::time::timeout(Duration::from_millis(200), frames_rx.recv()).await {
        Err(_) => {}      // timeout: no extra frame within the window.
        Ok(None) => {}    // channel closed by server (Close ack path).
        Ok(Some(extra)) => {
            panic!("loop synthesised an unexpected extra frame: {extra}");
        }
    }
}

// -----------------------------------------------------------------------------
// 19. Stream ending without a close frame → CliError::Other.
// -----------------------------------------------------------------------------

#[tokio::test]
async fn abrupt_disconnect_maps_to_other_error() {
    let (listener, port) = bind_ephemeral().await;
    let server = tokio::spawn(async move {
        let (stream, _) = listener.accept().await.expect("accept");
        let ws = tokio_tungstenite::accept_async(stream).await.expect("ws");
        // Drop the WS without sending a close frame. tungstenite will
        // surface this as an abnormal close to the client.
        drop(ws);
    });

    let cfg = WsConfig::new(format!("ws://127.0.0.1:{port}/"));
    let client = WebSocketClient::connect(cfg, &test_http_config())
        .await
        .unwrap();
    let shutdown = Box::pin(std::future::pending::<()>());
    let result = client.run_until_shutdown(shutdown).await;
    server.await.ok();

    let err = result.expect_err("abrupt drop should error");
    assert!(matches!(err, CliError::Other(_)));
    assert_eq!(err.exit_code(), 5);
}
