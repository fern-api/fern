use crate::prelude::*;
use crate::{ApiError, QueryBuilder, WebSocketClient, WebSocketMessage, WebSocketOptions};
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct RealtimeConnectOptions {
    pub model: Option<String>,
    pub temperature: Option<i64>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum RealtimeServerMessage {
    ReceiveEvent(ReceiveEvent),
    ReceiveSnakeCase(ReceiveSnakeCase),
    ReceiveEvent2(ReceiveEvent2),
    ReceiveEvent3(ReceiveEvent3),
    /// Unknown or new server message type not yet supported by this SDK version.
    Unknown(serde_json::Value),
}
pub struct RealtimeClient {
    ws: WebSocketClient,
    incoming_rx: mpsc::UnboundedReceiver<Result<WebSocketMessage, ApiError>>,
}
impl RealtimeClient {
    pub async fn connect(
        url: &str,
        session_id: &str,
        authorization: Option<&str>,
        options: &RealtimeConnectOptions,
    ) -> Result<Self, ApiError> {
        let full_url = format!("{}/realtime/{session_id}", url);
        let mut ws_options = WebSocketOptions::default();
        if let Some(auth) = authorization {
            ws_options
                .headers
                .insert("Authorization".to_string(), auth.to_string());
        }
        ws_options.query_params = QueryBuilder::new()
            .string("model", options.model.clone())
            .int("temperature", options.temperature.clone())
            .build()
            .unwrap_or_default();
        let (ws, incoming_rx) = WebSocketClient::connect(&full_url, ws_options).await?;
        Ok(Self { ws, incoming_rx })
    }

    pub async fn send_send(&self, message: &SendEvent) -> Result<(), ApiError> {
        self.ws.send_json(message).await
    }

    pub async fn send_send_snake_case(&self, message: &SendSnakeCase) -> Result<(), ApiError> {
        self.ws.send_json(message).await
    }

    pub async fn send_send_2(&self, message: &SendEvent2) -> Result<(), ApiError> {
        self.ws.send_json(message).await
    }

    pub async fn recv(&mut self) -> Option<Result<RealtimeServerMessage, ApiError>> {
        loop {
            match self.incoming_rx.recv().await {
                Some(Ok(WebSocketMessage::Text(raw))) => {
                    return Some(
                        serde_json::from_str::<RealtimeServerMessage>(&raw)
                            .map_err(ApiError::Serialization),
                    );
                }
                Some(Ok(WebSocketMessage::Binary(data))) => {
                    return Some(Err(ApiError::WebSocketError(format!(
                        "Received unexpected binary frame ({} bytes) on a JSON-only channel",
                        data.len()
                    ))));
                }
                Some(Ok(WebSocketMessage::Close(_))) => {
                    return None;
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
/// Connector for the Realtime WebSocket channel.
/// Provides access to the WebSocket channel through the root client.
pub struct RealtimeConnector {
    base_url: String,
    token: Option<String>,
}

impl RealtimeConnector {
    pub fn new(base_url: String, token: Option<String>) -> Self {
        Self { base_url, token }
    }

    pub async fn connect(
        &self,
        session_id: &str,
        options: &RealtimeConnectOptions,
    ) -> Result<RealtimeClient, ApiError> {
        let auth_header = self.token.as_ref().map(|t| format!("Bearer {}", t));
        RealtimeClient::connect(&self.base_url, session_id, auth_header.as_deref(), options).await
    }
}
