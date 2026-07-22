use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
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
    /// use seed_api::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client
    ///         .auth
    ///         .get_token(
    ///             &GetTokenAuthRequest {
    ///                 client_id: "client_id".to_string(),
    ///                 client_secret: "client_secret".to_string(),
    ///                 scopes: "scopes".to_string(),
    ///                 grant_type: GetTokenAuthRequestGrantType::ClientCredentials,
    ///                 tenant: "tenant".to_string(),
    ///                 audience: None,
    ///                 optional_hint: None,
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_token(
        &self,
        request: &GetTokenAuthRequest,
        options: Option<RequestOptions>,
    ) -> Result<TokenResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "token",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                QueryBuilder::new()
                    .serialize("audience", request.audience.clone())
                    .build(),
                options,
            )
            .await
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
    ///         .auth
    ///         .refresh_token(
    ///             &RefreshTokenAuthRequest {
    ///                 refresh_token: "refresh_token".to_string(),
    ///                 grant_type: RefreshTokenAuthRequestGrantType::RefreshToken,
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn refresh_token(
        &self,
        request: &RefreshTokenAuthRequest,
        options: Option<RequestOptions>,
    ) -> Result<TokenResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "refresh",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
