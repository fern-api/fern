use crate::prelude::*;
use crate::{ApiError, WebSocketClient, WebSocketMessage, WebSocketOptions};
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum RealtimeServerMessage {
    ReceiveEvent(ReceiveEvent),
    ReceiveSnakeCase(ReceiveSnakeCase),
    ReceiveEvent2(ReceiveEvent2),
    ReceiveEvent3(ReceiveEvent3),
    ErrorEvent(ErrorEvent),
}
pub struct RealtimeClient {
    ws: WebSocketClient,
    incoming_rx: mpsc::UnboundedReceiver<Result<WebSocketMessage, ApiError>>,
}
impl RealtimeClient {
    pub async fn connect(
        url: &str,
        session_id: &str,
        model: Option<&str>,
        temperature: Option<&str>,
        language_code: Option<&str>,
    ) -> Result<Self, ApiError> {
        let full_url = format!("{}/realtime/{session_id}", url);
        let mut options = WebSocketOptions::default();

        if let Some(v) = model {
            options
                .query_params
                .push(("model".to_string(), v.to_string()));
        }
        if let Some(v) = temperature {
            options
                .query_params
                .push(("temperature".to_string(), v.to_string()));
        }
        if let Some(v) = language_code {
            options
                .query_params
                .push(("language-code".to_string(), v.to_string()));
        }
        let (ws, incoming_rx) = WebSocketClient::connect(&full_url, options).await?;
        Ok(Self { ws, incoming_rx })
    }

    pub async fn send_send(&self, message: &SendEvent) -> Result<(), ApiError> {
        self.ws.send_json(message).await
    }

    pub async fn send_send_snake_case(&self, message: &SendSnakeCase) -> Result<(), ApiError> {
        self.ws.send_json(message).await
    }

    pub async fn send_send2(&self, message: &SendEvent2) -> Result<(), ApiError> {
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
/// Connector for the Realtime WebSocket channel.
/// Provides access to the WebSocket channel through the root client.
pub struct RealtimeConnector {
    base_url: String,
}

impl RealtimeConnector {
    pub fn new(base_url: String) -> Self {
        Self { base_url }
    }

    pub async fn connect(
        &self,
        session_id: &str,
        model: Option<&str>,
        temperature: Option<&str>,
        language_code: Option<&str>,
    ) -> Result<RealtimeClient, ApiError> {
        RealtimeClient::connect(
            &self.base_url,
            session_id,
            model,
            temperature,
            language_code,
        )
        .await
    }
}
