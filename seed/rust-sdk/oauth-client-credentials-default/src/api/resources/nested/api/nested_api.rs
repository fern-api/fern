use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ApiClient2 {
    pub http_client: HttpClient,
}

impl ApiClient2 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_oauth_client_credentials_default::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = OauthClientCredentialsDefaultClient::new(config).expect("Failed to build client");
    ///     client.nested.api.get_something(None).await;
    /// }
    /// ```
    pub async fn get_something(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client
            .execute_request(Method::GET, "/nested/get-something", None, None, options)
            .await
    }
}
