use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct CallsClient2 {
    pub http_client: HttpClient,
}

impl CallsClient2 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use messages_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = MessagesClient::new(config).expect("Failed to build client");
    ///     client.calls.calls.create_call(None).await;
    /// }
    /// ```
    pub async fn create_call(&self, options: Option<RequestOptions>) -> Result<Call, ApiError> {
        self.http_client
            .execute_request(Method::POST, "calls", None, None, options)
            .await
    }
}
