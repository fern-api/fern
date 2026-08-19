use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct AuthClient {
    pub http_client: HttpClient,
}

impl AuthClient {
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
    ///     client
    ///         .auth
    ///         .get_token(Some(
    ///             RequestOptions::new().additional_header("X-Api-Key", "api_key"),
    ///         ))
    ///         .await;
    /// }
    /// ```
    pub async fn get_token(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<TokenResponse, ApiError> {
        self.http_client
            .execute_request(Method::POST, "/token", None, None, options)
            .await
    }
}
