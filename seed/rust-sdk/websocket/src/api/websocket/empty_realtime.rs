use crate::{ApiError, WebSocketClient, WebSocketMessage, WebSocketOptions};
use tokio::sync::mpsc;

pub struct EmptyRealtimeClient {
    ws: WebSocketClient,
    incoming_rx: mpsc::UnboundedReceiver<Result<WebSocketMessage, ApiError>>,
}
impl EmptyRealtimeClient {
    pub async fn connect(url: &str, authorization: &str) -> Result<Self, ApiError> {
        let full_url = format!("{}/empty/realtime/", url);
        let mut options = WebSocketOptions::default();
        options
            .headers
            .insert("Authorization".to_string(), authorization.to_string());

        let (ws, incoming_rx) = WebSocketClient::connect(&full_url, options).await?;
        Ok(Self { ws, incoming_rx })
    }

    pub async fn recv(&mut self) -> Option<Result<WebSocketMessage, ApiError>> {
        self.incoming_rx.recv().await
    }

    pub async fn close(&self) -> Result<(), ApiError> {
        self.ws.close().await
    }
}
/// Connector for the EmptyRealtime WebSocket channel.
/// Provides access to the WebSocket channel through the root client.
pub struct EmptyRealtimeConnector {
    base_url: String,
    token: Option<String>,
}

impl EmptyRealtimeConnector {
    pub fn new(base_url: String, token: Option<String>) -> Self {
        Self { base_url, token }
    }

    pub async fn connect(&self) -> Result<EmptyRealtimeClient, ApiError> {
        let auth_header = self
            .token
            .as_ref()
            .map(|t| format!("Bearer {}", t))
            .unwrap_or_default();
        EmptyRealtimeClient::connect(&self.base_url, &auth_header).await
    }
}
