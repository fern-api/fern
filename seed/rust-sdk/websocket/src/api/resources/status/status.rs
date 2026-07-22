use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::api::{*};

pub struct StatusClient {
    pub http_client: HttpClient,
}

impl StatusClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_websocket::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = WebsocketClient::new(config).expect("Failed to build client");
    ///     client.status.get_status(None).await;
    /// }
    /// ```
    pub async fn get_status(&self, options: Option<RequestOptions>) -> Result<StatusResponse, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/status",
            None,
            None,
            options,
        ).await
    }

}

