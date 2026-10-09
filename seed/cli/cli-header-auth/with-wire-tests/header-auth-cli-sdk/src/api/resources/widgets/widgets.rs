use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct WidgetsClient {
    pub http_client: HttpClient,
}

impl WidgetsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use header_auth_cli_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         api_key: Some("<value>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = HeaderAuthCliClient::new(config).expect("Failed to build client");
    ///     client.widgets.list(None).await;
    /// }
    /// ```
    pub async fn list(&self, options: Option<RequestOptions>) -> Result<Vec<Widget>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "widgets", None, None, options)
            .await
    }
}
