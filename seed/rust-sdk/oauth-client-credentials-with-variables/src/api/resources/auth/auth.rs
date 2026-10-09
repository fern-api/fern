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
    /// use seed_oauth_client_credentials_with_variables::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client =
    ///         OauthClientCredentialsWithVariablesClient::new(config).expect("Failed to build client");
    ///     client
    ///         .auth
    ///         .get_token_with_client_credentials(
    ///             &GetTokenRequest {
    ///                 client_id: "client_id".to_string(),
    ///                 client_secret: "client_secret".to_string(),
    ///                 audience: "https://api.example.com".to_string(),
    ///                 grant_type: "client_credentials".to_string(),
    ///                 scope: Some("scope".to_string()),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_token_with_client_credentials(
        &self,
        request: &GetTokenRequest,
        options: Option<RequestOptions>,
    ) -> Result<TokenResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/token",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_oauth_client_credentials_with_variables::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client =
    ///         OauthClientCredentialsWithVariablesClient::new(config).expect("Failed to build client");
    ///     client
    ///         .auth
    ///         .refresh_token(
    ///             &RefreshTokenRequest {
    ///                 client_id: "client_id".to_string(),
    ///                 client_secret: "client_secret".to_string(),
    ///                 refresh_token: "refresh_token".to_string(),
    ///                 audience: "https://api.example.com".to_string(),
    ///                 grant_type: "refresh_token".to_string(),
    ///                 scope: Some("scope".to_string()),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn refresh_token(
        &self,
        request: &RefreshTokenRequest,
        options: Option<RequestOptions>,
    ) -> Result<TokenResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/token",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
