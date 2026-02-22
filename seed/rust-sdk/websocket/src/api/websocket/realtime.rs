use crate::{ApiError, WebSocketClient, WebSocketOptions};
use tokio::sync::{mpsc};
use crate::prelude::{*};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum RealtimeServerMessage {
    #[serde(rename = "receive")]
    ReceiveEvent(ReceiveEvent),
    #[serde(rename = "receive_snake_case")]
    ReceiveSnakeCase(ReceiveSnakeCase),
    #[serde(rename = "receive2")]
    ReceiveEvent2(ReceiveEvent2),
    #[serde(rename = "receive3")]
    ReceiveEvent3(ReceiveEvent3),
}
pub struct RealtimeClient {
    ws: WebSocketClient,
    incoming_rx: mpsc::UnboundedReceiver<Result<String, ApiError>>,
}
impl RealtimeClient {
    pub async fn connect(url: &str, session_id: &str, model: &str, temperature: &str, language_code: &str) -> Result<Self, ApiError> {
        let full_url = format!("{}/realtime/{session_id}", url);
        let mut options = WebSocketOptions::default();

        options.query_params.push(("model".to_string(), model.to_string()));
        options.query_params.push(("temperature".to_string(), temperature.to_string()));
        options.query_params.push(("language-code".to_string(), language_code.to_string()));
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
        match self.incoming_rx.recv().await {
            Some(Ok(raw)) => {
                Some(serde_json::from_str::<RealtimeServerMessage>(&raw).map_err(ApiError::Serialization))
            }
            Some(Err(e)) => Some(Err(e)),
            None => None,
        }
    }

    pub async fn close(&self) -> Result<(), ApiError> {
        self.ws.close().await
    }
}
