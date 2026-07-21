use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct IdentityClient {
    pub http_client: HttpClient,
}

impl IdentityClient {
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
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client
    ///         .identity
    ///         .get_token(
    ///             &GetTokenIdentityRequest {
    ///                 username: "username".to_string(),
    ///                 password: "password".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_token(
        &self,
        request: &GetTokenIdentityRequest,
        options: Option<RequestOptions>,
    ) -> Result<TokenResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "identity/token",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
