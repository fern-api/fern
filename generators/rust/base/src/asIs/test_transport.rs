//! In-process transport doubles for wire tests.
//!
//! [`CapturingTransport`] implements [`Transport`](super::http_client::Transport),
//! which sits below the SDK's auth, header, and retry logic. A request handed to
//! it is fully decorated — auth headers applied, query string built, body
//! serialized — so tests can assert the outgoing request exactly as it would
//! have gone on the wire, and reply with a canned response, without binding a
//! port or starting a mock server.
//!
//! ```ignore
//! let transport = CapturingTransport::new();
//! transport.push_json(200, r#"{"id":"user_1"}"#);
//!
//! let client = HttpClient::with_transport(config, transport.clone_handle())?;
//! let user: User = client.execute_request(Method::GET, "/users/user_1", None, None, None).await?;
//!
//! let request = transport.last_request().unwrap();
//! assert_eq!(request.header("Authorization"), Some("Bearer test-key"));
//! assert_eq!(request.url.path(), "/users/user_1");
//! ```

use super::http_client::{Transport, TransportError, TransportOverride};
use futures::future::BoxFuture;
use reqwest::{
    header::HeaderMap,
    Method, Request, Response, Url,
};
use std::{
    collections::VecDeque,
    sync::{Arc, Mutex},
};

/// A snapshot of a request as it reached the transport.
///
/// Captured eagerly rather than holding the `Request` itself, because a
/// `reqwest::Request` carrying a streaming body cannot be cloned.
#[derive(Debug, Clone)]
pub struct RecordedRequest {
    pub method: Method,
    pub url: Url,
    pub headers: HeaderMap,
    /// The serialized request body, or `None` for streaming bodies, which
    /// cannot be read without consuming them.
    pub body: Option<Vec<u8>>,
}

impl RecordedRequest {
    /// Returns a header value as a string, if present and valid UTF-8.
    pub fn header(&self, name: &str) -> Option<&str> {
        self.headers.get(name).and_then(|value| value.to_str().ok())
    }

    /// Returns the request body as a UTF-8 string.
    pub fn body_string(&self) -> Option<String> {
        self.body
            .as_ref()
            .map(|bytes| String::from_utf8_lossy(bytes).into_owned())
    }

    /// Parses the request body as JSON.
    pub fn body_json(&self) -> Option<serde_json::Value> {
        serde_json::from_slice(self.body.as_ref()?).ok()
    }

    /// Returns the query string parameters as a list of pairs, preserving order
    /// and repeats so that array-style parameters remain assertable.
    pub fn query_pairs(&self) -> Vec<(String, String)> {
        self.url
            .query_pairs()
            .map(|(key, value)| (key.into_owned(), value.into_owned()))
            .collect()
    }

    /// Returns the first value of a query parameter.
    pub fn query_param(&self, name: &str) -> Option<String> {
        self.url
            .query_pairs()
            .find(|(key, _)| key == name)
            .map(|(_, value)| value.into_owned())
    }
}

/// A canned reply to be returned by a [`CapturingTransport`].
#[derive(Debug, Clone)]
pub struct CannedResponse {
    status: u16,
    headers: Vec<(String, String)>,
    body: Vec<u8>,
}

impl CannedResponse {
    pub fn new(status: u16, body: impl Into<Vec<u8>>) -> Self {
        Self {
            status,
            headers: Vec::new(),
            body: body.into(),
        }
    }

    /// Builds a JSON response, setting `content-type: application/json`.
    pub fn json(status: u16, body: impl Into<String>) -> Self {
        Self::new(status, body.into().into_bytes())
            .with_header("content-type", "application/json")
    }

    pub fn with_header(mut self, name: impl Into<String>, value: impl Into<String>) -> Self {
        self.headers.push((name.into(), value.into()));
        self
    }
}

/// What a [`CapturingTransport`] should do for a given call.
enum Reply {
    Respond(CannedResponse),
    /// Simulates a transport-level send failure, exercising the SDK's retry path.
    Fail(String),
}

/// A [`Transport`] that records requests and replies from a queue, in process.
///
/// Cloning shares the same recording and queue, so a handle passed to the SDK
/// and a handle kept by the test observe the same state.
#[derive(Clone, Default)]
pub struct CapturingTransport {
    requests: Arc<Mutex<Vec<RecordedRequest>>>,
    replies: Arc<Mutex<VecDeque<Reply>>>,
}

impl CapturingTransport {
    pub fn new() -> Self {
        Self::default()
    }

    /// Returns a handle suitable for `HttpClient::with_transport`, sharing state
    /// with this one.
    pub fn clone_handle(&self) -> Arc<dyn Transport> {
        Arc::new(self.clone())
    }

    /// Returns this transport as a `ClientConfig::transport` value.
    ///
    /// This is the usual way to install it: every sub-client built from the
    /// config inherits the transport, so no per-client wiring is needed.
    pub fn as_override(&self) -> TransportOverride {
        TransportOverride::new(self.clone_handle())
    }

    /// Enqueues a response. Responses are returned in the order pushed, which is
    /// what makes retry and pagination sequences testable.
    pub fn push(&self, response: CannedResponse) -> &Self {
        self.replies
            .lock()
            .expect("CapturingTransport reply queue poisoned")
            .push_back(Reply::Respond(response));
        self
    }

    /// Enqueues a JSON response with `content-type: application/json`.
    pub fn push_json(&self, status: u16, body: impl Into<String>) -> &Self {
        self.push(CannedResponse::json(status, body))
    }

    /// Enqueues a simulated send failure, so the SDK's retry-on-network-error
    /// path can be exercised without a real socket.
    pub fn push_failure(&self, message: impl Into<String>) -> &Self {
        self.replies
            .lock()
            .expect("CapturingTransport reply queue poisoned")
            .push_back(Reply::Fail(message.into()));
        self
    }

    /// Returns every request received, in order.
    pub fn requests(&self) -> Vec<RecordedRequest> {
        self.requests
            .lock()
            .expect("CapturingTransport request log poisoned")
            .clone()
    }

    /// Returns the most recent request received.
    pub fn last_request(&self) -> Option<RecordedRequest> {
        self.requests
            .lock()
            .expect("CapturingTransport request log poisoned")
            .last()
            .cloned()
    }

    /// Returns the number of requests received, including retries.
    pub fn request_count(&self) -> usize {
        self.requests
            .lock()
            .expect("CapturingTransport request log poisoned")
            .len()
    }

    /// Clears recorded requests and any queued replies.
    pub fn reset(&self) {
        self.requests
            .lock()
            .expect("CapturingTransport request log poisoned")
            .clear();
        self.replies
            .lock()
            .expect("CapturingTransport reply queue poisoned")
            .clear();
    }

    fn record(&self, request: &Request) {
        let recorded = RecordedRequest {
            method: request.method().clone(),
            url: request.url().clone(),
            headers: request.headers().clone(),
            body: request
                .body()
                .and_then(|body| body.as_bytes())
                .map(|bytes| bytes.to_vec()),
        };
        self.requests
            .lock()
            .expect("CapturingTransport request log poisoned")
            .push(recorded);
    }

    fn next_reply(&self) -> Reply {
        self.replies
            .lock()
            .expect("CapturingTransport reply queue poisoned")
            .pop_front()
            // An exhausted queue replies 200 with an empty body rather than
            // panicking, so a test that only asserts the request need not
            // enqueue anything.
            .unwrap_or_else(|| Reply::Respond(CannedResponse::new(200, Vec::new())))
    }
}

impl Transport for CapturingTransport {
    fn execute(&self, request: Request) -> BoxFuture<'_, Result<Response, TransportError>> {
        self.record(&request);
        let reply = self.next_reply();

        Box::pin(async move {
            match reply {
                Reply::Respond(response) => Ok(build_response(response)),
                Reply::Fail(message) => Err(TransportError::Other(message.into())),
            }
        })
    }
}

/// Converts a canned response into a `reqwest::Response` without a network
/// round trip, via `reqwest`'s `From<http::Response<T>>` conversion.
fn build_response(response: CannedResponse) -> Response {
    let mut builder = http::Response::builder().status(response.status);
    for (name, value) in &response.headers {
        builder = builder.header(name, value);
    }
    let built = builder
        .body(response.body)
        .expect("canned response has invalid status or headers");
    Response::from(built)
}
