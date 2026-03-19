use crate::prelude::*;
use crate::{ApiError, WebSocketClient, WebSocketMessage, WebSocketOptions};
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum RealtimeNoAuthServerMessage {
    NoAuthReceiveEvent(NoAuthReceiveEvent),
}
#[derive(Debug, Clone, Default)]
pub struct RealtimeNoAuthConnectOptions {
    pub model: Option<String>,
}
pub struct RealtimeNoAuthClient {
    ws: WebSocketClient,
    incoming_rx: mpsc::UnboundedReceiver<Result<WebSocketMessage, ApiError>>,
}
impl RealtimeNoAuthClient {
    pub async fn connect(
        url: &str,
        session_id: &str,
        options: &RealtimeNoAuthConnectOptions,
    ) -> Result<Self, ApiError> {
        let full_url = format!("{}/realtime-no-auth/{session_id}", url);
        let mut ws_options = WebSocketOptions::default();

        if let Some(ref v) = options.model {
            ws_options
                .query_params
                .push(("model".to_string(), v.to_string()));
        }
        let (ws, incoming_rx) = WebSocketClient::connect(&full_url, ws_options).await?;
        Ok(Self { ws, incoming_rx })
    }

    pub async fn send_send(&self, message: &NoAuthSendEvent) -> Result<(), ApiError> {
        self.ws.send_json(message).await
    }

    pub async fn recv(&mut self) -> Option<Result<RealtimeNoAuthServerMessage, ApiError>> {
        loop {
            match self.incoming_rx.recv().await {
                Some(Ok(WebSocketMessage::Text(raw))) => {
                    return Some(
                        serde_json::from_str::<RealtimeNoAuthServerMessage>(&raw)
                            .map_err(ApiError::Serialization),
                    );
                }
                Some(Ok(WebSocketMessage::Binary(_))) => {
                    continue;
                }
                Some(Err(e)) => return Some(Err(e)),
                None => return None,
            }
        }
    }

    pub async fn close(&self) -> Result<(), ApiError> {
        self.ws.close().await
    }
}
/// Connector for the RealtimeNoAuth WebSocket channel.
/// Provides access to the WebSocket channel through the root client.
pub struct RealtimeNoAuthConnector {
    base_url: String,
}

impl RealtimeNoAuthConnector {
    pub fn new(base_url: String) -> Self {
        Self { base_url }
    }

    pub async fn connect(
        &self,
        session_id: &str,
        options: &RealtimeNoAuthConnectOptions,
    ) -> Result<RealtimeNoAuthClient, ApiError> {
        RealtimeNoAuthClient::connect(&self.base_url, session_id, options).await
    }
}
