use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ApiClient {
    pub http_client: HttpClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_inferred_auth_implicit_api_key::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = InferredAuthImplicitApiKeyClient::new(config).expect("Failed to build client");
    ///     client.nested_no_auth.api.get_something(None).await;
    /// }
    /// ```
    pub async fn get_something(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/nested-no-auth/get-something",
                None,
                None,
                options,
            )
            .await
    }
}
