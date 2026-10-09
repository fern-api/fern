use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// GET request with custom api key
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_header_token_environment_variable::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         api_key: Some("YOUR_HEADER_VALUE".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = HeaderTokenEnvironmentVariableClient::new(config).expect("Failed to build client");
    ///     client.service.get_with_bearer_token(None).await;
    /// }
    /// ```
    pub async fn get_with_bearer_token(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(Method::GET, "apiKey", None, None, options)
            .await
    }
}
