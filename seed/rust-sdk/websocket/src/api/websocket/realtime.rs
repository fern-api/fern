use crate::{ApiError, WebSocketClient, WebSocketMessage, WebSocketOptions, QueryBuilder};
use tokio::sync::{mpsc};
use crate::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct RealtimeConnectOptions {
    pub model: Option<String>,
    pub temperature: Option<i64>,
    #[serde(rename = "language-code")]
    pub language_code: Option<String>,
}
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(untagged)]
pub enum RealtimeServerMessage {
    ReceiveEvent(ReceiveEvent),
    ReceiveSnakeCase(ReceiveSnakeCase),
    ReceiveEvent2(ReceiveEvent2),
    ReceiveEvent3(ReceiveEvent3),
    TranscriptEvent(TranscriptEvent),
    FlushedEvent(FlushedEvent),
    ErrorEvent(ErrorEvent),
    /// Unknown or new server message type not yet supported by this SDK version.
    Unknown(serde_json::Value),
}

impl<'de> Deserialize<'de> for RealtimeServerMessage {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let value = serde_json::Value::deserialize(deserializer)?;

        let original_keys: std::collections::BTreeSet<String> = value
            .as_object()
            .map(|o| o.keys().cloned().collect())
            .unwrap_or_default();

        if original_keys.is_empty() {
            return Ok(Self::Unknown(value));
        }

        let mut best_variant: Option<Self> = None;
        let mut best_score: usize = 0;

        if let Ok(v) = serde_json::from_value::<ReceiveEvent>(value.clone()) {
            if let Ok(re) = serde_json::to_value(&v) {
                let score = re.as_object()
                    .map(|o| o.keys().filter(|k| original_keys.contains(k.as_str())).count())
                    .unwrap_or(0);
                if score > best_score {
                    best_score = score;
                    best_variant = Some(Self::ReceiveEvent(v));
                }
            }
        }

        if let Ok(v) = serde_json::from_value::<ReceiveSnakeCase>(value.clone()) {
            if let Ok(re) = serde_json::to_value(&v) {
                let score = re.as_object()
                    .map(|o| o.keys().filter(|k| original_keys.contains(k.as_str())).count())
                    .unwrap_or(0);
                if score > best_score {
                    best_score = score;
                    best_variant = Some(Self::ReceiveSnakeCase(v));
                }
            }
        }

        if let Ok(v) = serde_json::from_value::<ReceiveEvent2>(value.clone()) {
            if let Ok(re) = serde_json::to_value(&v) {
                let score = re.as_object()
                    .map(|o| o.keys().filter(|k| original_keys.contains(k.as_str())).count())
                    .unwrap_or(0);
                if score > best_score {
                    best_score = score;
                    best_variant = Some(Self::ReceiveEvent2(v));
                }
            }
        }

        if let Ok(v) = serde_json::from_value::<ReceiveEvent3>(value.clone()) {
            if let Ok(re) = serde_json::to_value(&v) {
                let score = re.as_object()
                    .map(|o| o.keys().filter(|k| original_keys.contains(k.as_str())).count())
                    .unwrap_or(0);
                if score > best_score {
                    best_score = score;
                    best_variant = Some(Self::ReceiveEvent3(v));
                }
            }
        }

        if let Ok(v) = serde_json::from_value::<TranscriptEvent>(value.clone()) {
            if let Ok(re) = serde_json::to_value(&v) {
                let score = re.as_object()
                    .map(|o| o.keys().filter(|k| original_keys.contains(k.as_str())).count())
                    .unwrap_or(0);
                if score > best_score {
                    best_score = score;
                    best_variant = Some(Self::TranscriptEvent(v));
                }
            }
        }

        if let Ok(v) = serde_json::from_value::<FlushedEvent>(value.clone()) {
            if let Ok(re) = serde_json::to_value(&v) {
                let score = re.as_object()
                    .map(|o| o.keys().filter(|k| original_keys.contains(k.as_str())).count())
                    .unwrap_or(0);
                if score > best_score {
                    best_score = score;
                    best_variant = Some(Self::FlushedEvent(v));
                }
            }
        }

        if let Ok(v) = serde_json::from_value::<ErrorEvent>(value.clone()) {
            if let Ok(re) = serde_json::to_value(&v) {
                let score = re.as_object()
                    .map(|o| o.keys().filter(|k| original_keys.contains(k.as_str())).count())
                    .unwrap_or(0);
                if score > best_score {
                    best_score = score;
                    best_variant = Some(Self::ErrorEvent(v));
                }
            }
        }

        let _ = best_score;
        Ok(best_variant.unwrap_or(Self::Unknown(value)))
    }
}
pub struct RealtimeClient {
    ws: WebSocketClient,
    incoming_rx: mpsc::UnboundedReceiver<Result<WebSocketMessage, ApiError>>,
}
impl RealtimeClient {
    pub async fn create_realtime_connection(url: &str, session_id: &str, authorization: Option<&str>, options: &RealtimeConnectOptions) -> Result<Self, ApiError> {
        let full_url = format!("{}/realtime/{session_id}", url);
        let mut ws_options = WebSocketOptions::default();
        if let Some(auth) = authorization {
            ws_options.headers.insert("Authorization".to_string(), auth.to_string());
        }
        ws_options.query_params = QueryBuilder::new()
            .string("model", options.model.clone())
            .int("temperature", options.temperature.clone())
            .string("language-code", options.language_code.clone())
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

    pub async fn custom_send(&self, message: &SendEvent2) -> Result<(), ApiError> {
        self.ws.send_json(message).await
    }

    pub async fn recv(&mut self) -> Option<Result<RealtimeServerMessage, ApiError>> {
        match self.incoming_rx.recv().await {
            Some(Ok(WebSocketMessage::Text(raw))) => {
                Some(serde_json::from_str::<RealtimeServerMessage>(&raw).map_err(ApiError::Serialization))
            }
            Some(Ok(WebSocketMessage::Binary(data))) => {
                Some(Err(ApiError::WebSocketError(
                    format!("Received unexpected binary frame ({} bytes) on a JSON-only channel", data.len())
                )))
            }
            Some(Ok(WebSocketMessage::Close(_))) => None,
            Some(Err(e)) => Some(Err(e)),
            None => None,
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
    auth_header: Option<String>,
}

impl RealtimeConnector {
    pub fn new(base_url: String, auth_header: Option<String>) -> Self {
        Self { base_url, auth_header }
    }

    pub async fn create_realtime_connection(&self, session_id: &str, options: &RealtimeConnectOptions) -> Result<RealtimeClient, ApiError> {
        RealtimeClient::create_realtime_connection(&self.base_url, session_id, self.auth_header.as_deref(), options).await
    }
}
