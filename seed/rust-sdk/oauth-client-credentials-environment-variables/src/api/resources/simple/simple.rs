use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct SimpleClient {
    pub http_client: HttpClient,
}

impl SimpleClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_oauth_client_credentials_environment_variables::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = OauthClientCredentialsEnvironmentVariablesClient::new(config)
    ///         .expect("Failed to build client");
    ///     client.simple.get_something(None).await;
    /// }
    /// ```
    pub async fn get_something(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client
            .execute_request(Method::GET, "/get-something", None, None, options)
            .await
    }
}
