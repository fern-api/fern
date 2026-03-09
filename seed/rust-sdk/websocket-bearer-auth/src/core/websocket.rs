use crate::ApiError;
use futures::{
    stream::{SplitSink, SplitStream},
    SinkExt, StreamExt,
};
use serde::{de::DeserializeOwned, Serialize};
use std::{collections::HashMap, sync::Arc, time::Duration};
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

#[derive(Debug, Clone)]
pub enum WebSocketMessage {
    Text(String),
    Binary(Vec<u8>),
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
    pub reconnect_interval: Duration,
    pub connection_timeout: Duration,
}

impl Default for WebSocketOptions {
    fn default() -> Self {
        Self {
            headers: HashMap::new(),
            query_params: Vec::new(),
            reconnect: true,
            max_reconnect_attempts: 5,
            reconnect_interval: Duration::from_secs(1),
            connection_timeout: Duration::from_secs(10),
        }
    }
}

pub struct WebSocketClient {
    url: String,
    options: WebSocketOptions,
    sink: Arc<Mutex<Option<WsSink>>>,
    state: Arc<Mutex<WebSocketState>>,
    close_notify: Arc<Notify>,
}

impl WebSocketClient {
    pub async fn connect(
        url: &str,
        options: WebSocketOptions,
    ) -> Result<
        (
            Self,
            mpsc::UnboundedReceiver<Result<WebSocketMessage, ApiError>>,
        ),
        ApiError,
    > {
        let (incoming_tx, incoming_rx) = mpsc::unbounded_channel();

        let client = Self {
            url: url.to_string(),
            options: options.clone(),
            sink: Arc::new(Mutex::new(None)),
            state: Arc::new(Mutex::new(WebSocketState::Connecting)),
            close_notify: Arc::new(Notify::new()),
        };

        let read = client.establish_connection().await?;

        let sink = client.sink.clone();
        let state = client.state.clone();
        let close_notify = client.close_notify.clone();
        let url_clone = client.url.clone();
        let options_clone = client.options.clone();

        tokio::spawn(async move {
            Self::read_loop(
                read,
                sink,
                state,
                close_notify,
                incoming_tx,
                url_clone,
                options_clone,
            )
            .await;
        });

        Ok((client, incoming_rx))
    }

    async fn establish_connection(&self) -> Result<WsSource, ApiError> {
        let uri: Uri = self.build_url().parse().map_err(
            |e: tokio_tungstenite::tungstenite::http::uri::InvalidUri| {
                ApiError::WebSocketError(format!("Invalid URL: {}", e))
            },
        )?;

        let mut request = uri
            .into_client_request()
            .map_err(|e| ApiError::WebSocketError(format!("Failed to build request: {}", e)))?;

        let headers = request.headers_mut();
        for (key, value) in &self.options.headers {
            let header_name: HeaderName = key.parse().map_err(|_| ApiError::InvalidHeader)?;
            let header_value: HeaderValue = value.parse().map_err(|_| ApiError::InvalidHeader)?;
            headers.insert(header_name, header_value);
        }

        let connect_future = connect_async(request);
        let (ws_stream, _response) =
            tokio::time::timeout(self.options.connection_timeout, connect_future)
                .await
                .map_err(|_| ApiError::WebSocketError("Connection timed out".to_string()))?
                .map_err(|e| ApiError::WebSocketError(format!("Connection failed: {}", e)))?;

        let (write, read) = ws_stream.split();

        {
            let mut sink = self.sink.lock().await;
            *sink = Some(write);
        }

        {
            let mut state = self.state.lock().await;
            *state = WebSocketState::Open;
        }

        Ok(read)
    }

    fn build_url(&self) -> String {
        if self.options.query_params.is_empty() {
            return self.url.clone();
        }
        let query: String = self
            .options
            .query_params
            .iter()
            .map(|(k, v)| format!("{}={}", urlencoding::encode(k), urlencoding::encode(v)))
            .collect::<Vec<_>>()
            .join("&");
        format!("{}?{}", self.url, query)
    }

    pub async fn send_json<T: Serialize>(&self, message: &T) -> Result<(), ApiError> {
        let json = serde_json::to_string(message).map_err(ApiError::Serialization)?;
        self.send_raw(json).await
    }

    pub async fn send_raw(&self, message: String) -> Result<(), ApiError> {
        let mut sink_guard = self.sink.lock().await;
        match sink_guard.as_mut() {
            Some(sink) => sink
                .send(Message::Text(message))
                .await
                .map_err(|e| ApiError::WebSocketError(format!("Send failed: {}", e))),
            None => Err(ApiError::WebSocketError(
                "WebSocket is not connected".to_string(),
            )),
        }
    }

    pub async fn send_binary(&self, data: &[u8]) -> Result<(), ApiError> {
        let mut sink_guard = self.sink.lock().await;
        match sink_guard.as_mut() {
            Some(sink) => sink
                .send(Message::Binary(data.to_vec()))
                .await
                .map_err(|e| ApiError::WebSocketError(format!("Send failed: {}", e))),
            None => Err(ApiError::WebSocketError(
                "WebSocket is not connected".to_string(),
            )),
        }
    }

    pub async fn close(&self) -> Result<(), ApiError> {
        {
            let mut state = self.state.lock().await;
            *state = WebSocketState::Closing;
        }

        let mut sink_guard = self.sink.lock().await;
        if let Some(sink) = sink_guard.as_mut() {
            let _ = sink.send(Message::Close(None)).await;
        }

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

    async fn read_loop(
        mut read: WsSource,
        sink: Arc<Mutex<Option<WsSink>>>,
        state: Arc<Mutex<WebSocketState>>,
        close_notify: Arc<Notify>,
        incoming_tx: mpsc::UnboundedSender<Result<WebSocketMessage, ApiError>>,
        url: String,
        options: WebSocketOptions,
    ) {
        let mut reconnect_attempts: u32 = 0;

        loop {
            tokio::select! {
                _ = close_notify.notified() => {
                    break;
                }
                msg = read.next() => {
                    match msg {
                        Some(Ok(Message::Text(text))) => {
                            reconnect_attempts = 0;
                            if incoming_tx.send(Ok(WebSocketMessage::Text(text))).is_err() {
                                break;
                            }
                        }
                        Some(Ok(Message::Binary(data))) => {
                            reconnect_attempts = 0;
                            if incoming_tx.send(Ok(WebSocketMessage::Binary(data))).is_err() {
                                break;
                            }
                        }
                        Some(Ok(Message::Close(_))) => {
                            let mut s = state.lock().await;
                            *s = WebSocketState::Closed;
                            break;
                        }
                        Some(Ok(Message::Ping(_))) | Some(Ok(Message::Pong(_))) | Some(Ok(Message::Frame(_))) => {
                            // Protocol frames handled automatically by tungstenite
                        }
                        Some(Err(e)) => {
                            let error = ApiError::WebSocketError(format!("Read error: {}", e));
                            if !options.reconnect || reconnect_attempts >= options.max_reconnect_attempts {
                                let _ = incoming_tx.send(Err(error));
                                let mut s = state.lock().await;
                                *s = WebSocketState::Closed;
                                break;
                            }

                            reconnect_attempts += 1;
                            {
                                let mut s = state.lock().await;
                                *s = WebSocketState::Connecting;
                            }

                            tokio::time::sleep(options.reconnect_interval).await;

                            match Self::reconnect(&url, &options, &sink).await {
                                Ok(new_read) => {
                                    read = new_read;
                                    let mut s = state.lock().await;
                                    *s = WebSocketState::Open;
                                }
                                Err(reconnect_err) => {
                                    let _ = incoming_tx.send(Err(reconnect_err));
                                    let mut s = state.lock().await;
                                    *s = WebSocketState::Closed;
                                    break;
                                }
                            }
                        }
                        None => {
                            // Stream ended
                            if !options.reconnect || reconnect_attempts >= options.max_reconnect_attempts {
                                let mut s = state.lock().await;
                                *s = WebSocketState::Closed;
                                break;
                            }

                            reconnect_attempts += 1;
                            {
                                let mut s = state.lock().await;
                                *s = WebSocketState::Connecting;
                            }

                            tokio::time::sleep(options.reconnect_interval).await;

                            match Self::reconnect(&url, &options, &sink).await {
                                Ok(new_read) => {
                                    read = new_read;
                                    let mut s = state.lock().await;
                                    *s = WebSocketState::Open;
                                }
                                Err(reconnect_err) => {
                                    let _ = incoming_tx.send(Err(reconnect_err));
                                    let mut s = state.lock().await;
                                    *s = WebSocketState::Closed;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    async fn reconnect(
        url: &str,
        options: &WebSocketOptions,
        sink: &Arc<Mutex<Option<WsSink>>>,
    ) -> Result<WsSource, ApiError> {
        let full_url = if options.query_params.is_empty() {
            url.to_string()
        } else {
            let query: String = options
                .query_params
                .iter()
                .map(|(k, v)| format!("{}={}", urlencoding::encode(k), urlencoding::encode(v)))
                .collect::<Vec<_>>()
                .join("&");
            format!("{}?{}", url, query)
        };

        let uri: Uri = full_url.parse().map_err(
            |e: tokio_tungstenite::tungstenite::http::uri::InvalidUri| {
                ApiError::WebSocketError(format!("Invalid URL: {}", e))
            },
        )?;

        let mut request = uri
            .into_client_request()
            .map_err(|e| ApiError::WebSocketError(format!("Failed to build request: {}", e)))?;

        let headers = request.headers_mut();
        for (key, value) in &options.headers {
            let header_name: HeaderName = key.parse().map_err(|_| ApiError::InvalidHeader)?;
            let header_value: HeaderValue = value.parse().map_err(|_| ApiError::InvalidHeader)?;
            headers.insert(header_name, header_value);
        }

        let (ws_stream, _response) =
            tokio::time::timeout(options.connection_timeout, connect_async(request))
                .await
                .map_err(|_| ApiError::WebSocketError("Reconnection timed out".to_string()))?
                .map_err(|e| ApiError::WebSocketError(format!("Reconnection failed: {}", e)))?;

        let (write, read) = ws_stream.split();

        {
            let mut sink_guard = sink.lock().await;
            *sink_guard = Some(write);
        }

        Ok(read)
    }
}

pub fn parse_websocket_message<T: DeserializeOwned>(raw: &str) -> Result<T, ApiError> {
    serde_json::from_str(raw).map_err(ApiError::Serialization)
}
