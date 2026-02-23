use crate::{ApiError, WebSocketClient, WebSocketMessage, WebSocketOptions};
use tokio::sync::mpsc;

pub struct EmptyRealtimeClient {
    ws: WebSocketClient,
    incoming_rx: mpsc::UnboundedReceiver<Result<WebSocketMessage, ApiError>>,
}
impl EmptyRealtimeClient {
    pub async fn connect(url: &str) -> Result<Self, ApiError> {
        let full_url = format!("{}/empty/realtime/", url);
        let options = WebSocketOptions::default();

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
