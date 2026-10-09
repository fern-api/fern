use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ItemsClient {
    pub http_client: HttpClient,
}

impl ItemsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_api::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client.items.list_items(None).await;
    /// }
    /// ```
    pub async fn list_items(&self, options: Option<RequestOptions>) -> Result<String, ApiError> {
        let base_url = self
            .http_client
            .config()
            .service_url(|environment| environment.base_url());
        self.http_client
            .execute_request_with_base_url(base_url, Method::GET, "items", None, None, options)
            .await
    }
}
