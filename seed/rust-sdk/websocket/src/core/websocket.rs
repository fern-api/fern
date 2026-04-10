use crate::ApiError;
use futures::{
    stream::{SplitSink, SplitStream},
    SinkExt, StreamExt,
};
use rand::Rng;
use serde::Serialize;
use std::{
    collections::{HashMap, VecDeque},
    sync::Arc,
    time::Duration,
};
use tokio::sync::{mpsc, Mutex, Notify};
use tokio_tungstenite::{
    connect_async,
    tungstenite::{
        client::IntoClientRequest,
        http::{HeaderName, HeaderValue, Uri},
        protocol::Message,
    },
    MaybeTlsStream, WebSocketStream,
};

type WsStream = WebSocketStream<MaybeTlsStream<tokio::net::TcpStream>>;
type WsSink = SplitSink<WsStream, Message>;
type WsSource = SplitStream<WsStream>;

/// Information about why a WebSocket connection was closed.
#[derive(Debug, Clone)]
pub struct DisconnectInfo {
    /// The WebSocket close code (e.g., 1000 for normal closure).
    pub code: Option<u16>,
    /// The close reason string from the server.
    pub reason: Option<String>,
}

#[derive(Debug, Clone)]
pub enum WebSocketMessage {
    Text(String),
    Binary(Vec<u8>),
    /// The connection was closed. Contains the close code and reason if provided.
    Close(DisconnectInfo),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WebSocketState {
    Connecting,
    Open,
    Closing,
    Closed,
}

#[derive(Debug, Clone)]
pub struct WebSocketOptions {
    pub headers: HashMap<String, String>,
    pub query_params: Vec<(String, String)>,
    pub reconnect: bool,
    pub max_reconnect_attempts: u32,
    pub min_reconnect_delay: Duration,
    pub max_reconnect_delay: Duration,
    pub reconnect_delay_growth_factor: f64,
    pub connection_timeout: Duration,
    pub max_queued_messages: usize,
}

impl Default for WebSocketOptions {
    fn default() -> Self {
        Self {
            headers: HashMap::new(),
            query_params: Vec::new(),
            reconnect: true,
            max_reconnect_attempts: 5,
            min_reconnect_delay: Duration::from_secs(1),
            max_reconnect_delay: Duration::from_secs(10),
            reconnect_delay_growth_factor: 1.3,
            connection_timeout: Duration::from_secs(10),
            max_queued_messages: 1000,
        }
    }
}

/// Shared reconnection state passed between `read_loop` and `try_reconnect`,
/// grouping the Arc-wrapped fields that both functions need.
struct ReconnectContext {
    sink: Arc<Mutex<Option<WsSink>>>,
    state: Arc<Mutex<WebSocketState>>,
    close_notify: Arc<Notify>,
    incoming_tx: mpsc::UnboundedSender<Result<WebSocketMessage, ApiError>>,
    url: String,
    options: WebSocketOptions,
    text_queue: Arc<Mutex<VecDeque<String>>>,
    binary_queue: Arc<Mutex<VecDeque<Vec<u8>>>>,
}

pub struct WebSocketClient {
    url: String,
    options: WebSocketOptions,
    sink: Arc<Mutex<Option<WsSink>>>,
    state: Arc<Mutex<WebSocketState>>,
    close_notify: Arc<Notify>,
    text_queue: Arc<Mutex<VecDeque<String>>>,
    binary_queue: Arc<Mutex<VecDeque<Vec<u8>>>>,
}

impl WebSocketClient {
    pub async fn connect(url: &str, options: WebSocketOptions) -> Result<(Self, mpsc::UnboundedReceiver<Result<WebSocketMessage, ApiError>>), ApiError> {
        let (incoming_tx, incoming_rx) = mpsc::unbounded_channel();

        let full_url = Self::build_ws_url(url, &options.query_params);
        let sink = Arc::new(Mutex::new(None));

        let read = Self::open_connection(&full_url, &options, &sink).await?;

        let client = Self {
            url: url.to_string(),
            options: options.clone(),
            sink: sink.clone(),
            state: Arc::new(Mutex::new(WebSocketState::Open)),
            close_notify: Arc::new(Notify::new()),
            text_queue: Arc::new(Mutex::new(VecDeque::new())),
            binary_queue: Arc::new(Mutex::new(VecDeque::new())),
        };

        let ctx = ReconnectContext {
            sink,
            state: client.state.clone(),
            close_notify: client.close_notify.clone(),
            incoming_tx,
            url: client.url.clone(),
            options: client.options.clone(),
            text_queue: client.text_queue.clone(),
            binary_queue: client.binary_queue.clone(),
        };

        tokio::spawn(async move {
            Self::read_loop(read, ctx).await;
        });

        Ok((client, incoming_rx))
    }

    /// Shared connection logic used by both initial connect and reconnect.
    async fn open_connection(
        full_url: &str,
        options: &WebSocketOptions,
        sink: &Arc<Mutex<Option<WsSink>>>,
    ) -> Result<WsSource, ApiError> {
        let uri: Uri = full_url
            .parse()
            .map_err(|e: tokio_tungstenite::tungstenite::http::uri::InvalidUri| {
                ApiError::WebSocketError(format!("Invalid URL: {}", e))
            })?;

        let mut request = uri
            .into_client_request()
            .map_err(|e| ApiError::WebSocketError(format!("Failed to build request: {}", e)))?;

        let headers = request.headers_mut();
        for (key, value) in &options.headers {
            let header_name: HeaderName = key
                .parse()
                .map_err(|_| ApiError::InvalidHeader)?;
            let header_value: HeaderValue = value
                .parse()
                .map_err(|_| ApiError::InvalidHeader)?;
            headers.insert(header_name, header_value);
        }

        let (ws_stream, _response) = tokio::time::timeout(
            options.connection_timeout,
            connect_async(request),
        )
        .await
        .map_err(|_| ApiError::WebSocketError("Connection timed out".to_string()))?
        .map_err(|e| ApiError::WebSocketError(format!("Connection failed: {}", e)))?;

        let (write, read) = ws_stream.split();

        {
            let mut sink_guard = sink.lock().await;
            *sink_guard = Some(write);
        }

        Ok(read)
    }

    /// Convert HTTP(S) URLs to WS(S) URLs for WebSocket connections.
    /// tokio-tungstenite requires ws:// or wss:// scheme.
    fn to_ws_url(url: &str) -> String {
        if url.starts_with("https://") {
            format!("wss://{}", &url[8..])
        } else if url.starts_with("http://") {
            format!("ws://{}", &url[7..])
        } else {
            url.to_string()
        }
    }

    fn build_ws_url(url: &str, query_params: &[(String, String)]) -> String {
        let base = Self::to_ws_url(url);
        if query_params.is_empty() {
            return base;
        }
        let query: String = query_params
            .iter()
            .map(|(k, v)| format!("{}={}", urlencoding::encode(k), urlencoding::encode(v)))
            .collect::<Vec<_>>()
            .join("&");
        format!("{}?{}", base, query)
    }

    fn maybe_reset_reconnect_attempts(
        last_connected_at: &Option<tokio::time::Instant>,
        reconnect_attempts: &mut u32,
    ) {
        if let Some(connected_at) = last_connected_at {
            if connected_at.elapsed() >= Duration::from_secs(5) {
                *reconnect_attempts = 0;
            }
        }
    }

    fn get_reconnect_delay(options: &WebSocketOptions, attempt: u32) -> Duration {
        let base = if attempt <= 1 {
            options.min_reconnect_delay.as_millis() as f64
        } else {
            let delay = options.min_reconnect_delay.as_millis() as f64
                * options.reconnect_delay_growth_factor.powi((attempt - 1) as i32);
            delay.min(options.max_reconnect_delay.as_millis() as f64)
        };
        let jitter = rand::rng().random_range(0.0..=0.25);
        let jittered = base * (1.0 + jitter);
        Duration::from_millis(jittered as u64)
    }

    pub async fn send_json<T: Serialize>(&self, message: &T) -> Result<(), ApiError> {
        let json = serde_json::to_string(message).map_err(ApiError::Serialization)?;
        self.send_raw(json).await
    }

    /// Send a text message. If the connection is temporarily down and reconnect
    /// is enabled, the message is queued and will be flushed after reconnection.
    ///
    /// Holds the sink lock for the entire operation so that queued messages
    /// (flushed under the same lock after reconnect) are always sent before
    /// any new direct sends, preserving ordering.
    pub async fn send_raw(&self, message: String) -> Result<(), ApiError> {
        let mut sink_guard = self.sink.lock().await;
        match sink_guard.as_mut() {
            Some(sink) => {
                sink.send(Message::Text(message))
                    .await
                    .map_err(|e| ApiError::WebSocketError(format!("Send failed: {}", e)))
            }
            None => {
                let mut queue = self.text_queue.lock().await;
                if queue.len() >= self.options.max_queued_messages {
                    return Err(ApiError::WebSocketError(
                        "Message queue is full".to_string(),
                    ));
                }
                queue.push_back(message);
                Ok(())
            }
        }
    }

    /// Send a binary message. If the connection is temporarily down and reconnect
    /// is enabled, the data is queued and will be flushed after reconnection.
    ///
    /// Holds the sink lock for the entire operation so that queued messages
    /// (flushed under the same lock after reconnect) are always sent before
    /// any new direct sends, preserving ordering.
    pub async fn send_binary(&self, data: &[u8]) -> Result<(), ApiError> {
        let mut sink_guard = self.sink.lock().await;
        match sink_guard.as_mut() {
            Some(sink) => {
                sink.send(Message::Binary(data.to_vec()))
                    .await
                    .map_err(|e| ApiError::WebSocketError(format!("Send failed: {}", e)))
            }
            None => {
                let mut queue = self.binary_queue.lock().await;
                if queue.len() >= self.options.max_queued_messages {
                    return Err(ApiError::WebSocketError(
                        "Message queue is full".to_string(),
                    ));
                }
                queue.push_back(data.to_vec());
                Ok(())
            }
        }
    }

    /// Initiate a graceful WebSocket close.
    ///
    /// Sends a Close frame and waits up to 5 seconds for the server's
    /// Close response (delivered via `close_notify` from the read loop).
    /// If the server doesn't respond in time, the connection is closed anyway.
    pub async fn close(&self) -> Result<(), ApiError> {
        {
            let mut state = self.state.lock().await;
            if *state == WebSocketState::Closed || *state == WebSocketState::Closing {
                return Ok(());
            }
            *state = WebSocketState::Closing;
        }

        {
            let mut sink_guard = self.sink.lock().await;
            if let Some(sink) = sink_guard.as_mut() {
                let _ = sink.send(Message::Close(None)).await;
            }
        }

        // Wait for the server's Close response (the read loop will notify us),
        // but don't block forever if the server never responds.
        let close_timeout = Duration::from_secs(5);
        let _ = tokio::time::timeout(close_timeout, self.close_notify.notified()).await;

        {
            let mut state = self.state.lock().await;
            *state = WebSocketState::Closed;
        }

        self.close_notify.notify_waiters();
        Ok(())
    }

    pub async fn state(&self) -> WebSocketState {
        *self.state.lock().await
    }

    /// Flush queued messages after a successful reconnect.
    ///
    /// On send failure, the failed message is pushed back to the front of the
    /// queue so it can be retried on the next reconnect. Remaining queued
    /// messages are preserved.
    async fn flush_queues(ctx: &ReconnectContext) {
        let mut sink_guard = ctx.sink.lock().await;
        let s = match sink_guard.as_mut() {
            Some(s) => s,
            None => return,
        };
        {
            let mut queue = ctx.text_queue.lock().await;
            while let Some(message) = queue.pop_front() {
                if s.send(Message::Text(message.clone())).await.is_err() {
                    queue.push_front(message);
                    return;
                }
            }
        }
        {
            let mut queue = ctx.binary_queue.lock().await;
            while let Some(message) = queue.pop_front() {
                if s.send(Message::Binary(message.clone())).await.is_err() {
                    queue.push_front(message);
                    return;
                }
            }
        }
    }

    /// Attempt to reconnect after a disconnection, retrying with exponential
    /// backoff up to `max_reconnect_attempts` times. Returns Ok(()) with the
    /// new read stream on success, or Err if all attempts are exhausted.
    async fn try_reconnect(
        read: &mut WsSource,
        reconnect_attempts: &mut u32,
        last_connected_at: &mut Option<tokio::time::Instant>,
        ctx: &ReconnectContext,
    ) -> Result<(), ApiError> {
        if !ctx.options.reconnect {
            let mut s = ctx.state.lock().await;
            *s = WebSocketState::Closed;
            return Err(ApiError::WebSocketError("Reconnect disabled".to_string()));
        }

        let mut last_error = None;
        let full_url = Self::build_ws_url(&ctx.url, &ctx.options.query_params);

        loop {
            if *reconnect_attempts >= ctx.options.max_reconnect_attempts {
                let mut s = ctx.state.lock().await;
                *s = WebSocketState::Closed;
                return Err(last_error.unwrap_or_else(|| {
                    ApiError::WebSocketError("Max reconnect attempts reached".to_string())
                }));
            }

            *reconnect_attempts += 1;
            {
                let mut s = ctx.state.lock().await;
                *s = WebSocketState::Connecting;
            }

            let delay = Self::get_reconnect_delay(&ctx.options, *reconnect_attempts);
            tokio::time::sleep(delay).await;

            match Self::open_connection(&full_url, &ctx.options, &ctx.sink).await {
                Ok(new_read) => {
                    *read = new_read;
                    *last_connected_at = Some(tokio::time::Instant::now());
                    let mut s = ctx.state.lock().await;
                    *s = WebSocketState::Open;
                    drop(s);
                    Self::flush_queues(ctx).await;
                    return Ok(());
                }
                Err(e) => {
                    last_error = Some(e);
                    continue;
                }
            }
        }
    }

    async fn read_loop(mut read: WsSource, ctx: ReconnectContext) {
        let mut reconnect_attempts: u32 = 0;
        let mut last_connected_at: Option<tokio::time::Instant> = None;

        loop {
            tokio::select! {
                _ = ctx.close_notify.notified() => {
                    break;
                }
                msg = read.next() => {
                    match msg {
                        Some(Ok(Message::Text(text))) => {
                            Self::maybe_reset_reconnect_attempts(&last_connected_at, &mut reconnect_attempts);
                            if ctx.incoming_tx.send(Ok(WebSocketMessage::Text(text))).is_err() {
                                break;
                            }
                        }
                        Some(Ok(Message::Binary(data))) => {
                            Self::maybe_reset_reconnect_attempts(&last_connected_at, &mut reconnect_attempts);
                            if ctx.incoming_tx.send(Ok(WebSocketMessage::Binary(data))).is_err() {
                                break;
                            }
                        }
                        Some(Ok(Message::Close(frame))) => {
                            let info = DisconnectInfo {
                                code: frame.as_ref().map(|f| f.code.into()),
                                reason: frame.as_ref().map(|f| f.reason.to_string()).filter(|r| !r.is_empty()),
                            };
                            let _ = ctx.incoming_tx.send(Ok(WebSocketMessage::Close(info)));
                            let mut s = ctx.state.lock().await;
                            *s = WebSocketState::Closed;
                            ctx.close_notify.notify_waiters();
                            break;
                        }
                        Some(Ok(Message::Ping(_))) | Some(Ok(Message::Pong(_))) | Some(Ok(Message::Frame(_))) => {
                            // Protocol frames handled automatically by tungstenite
                        }
                        Some(Err(e)) => {
                            let error_msg = format!("Read error: {}", e);
                            match Self::try_reconnect(
                                &mut read, &mut reconnect_attempts, &mut last_connected_at, &ctx,
                            ).await {
                                Ok(()) => continue,
                                Err(_) => {
                                    let _ = ctx.incoming_tx.send(Err(ApiError::WebSocketError(error_msg)));
                                    break;
                                }
                            }
                        }
                        None => {
                            // Stream ended unexpectedly
                            match Self::try_reconnect(
                                &mut read, &mut reconnect_attempts, &mut last_connected_at, &ctx,
                            ).await {
                                Ok(()) => continue,
                                Err(reconnect_err) => {
                                    let _ = ctx.incoming_tx.send(Err(reconnect_err));
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
