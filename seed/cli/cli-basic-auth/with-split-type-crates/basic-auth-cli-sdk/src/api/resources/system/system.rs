use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct SystemClient {
    pub http_client: HttpClient,
}

impl SystemClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use basic_auth_cli_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         username: Some("<username>".to_string()),
    ///         password: Some("<password>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = BasicAuthCliClient::new(config).expect("Failed to build client");
    ///     client.system.health(None).await;
    /// }
    /// ```
    pub async fn health(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<HealthSystemResponse, ApiError> {
        self.http_client
            .execute_request(Method::GET, "health", None, None, options)
            .await
    }
}
