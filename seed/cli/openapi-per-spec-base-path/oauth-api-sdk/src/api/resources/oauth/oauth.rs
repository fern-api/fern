use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct OauthClient {
    pub http_client: HttpClient,
}

impl OauthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use oauth_api_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = OauthApiClient::new(config).expect("Failed to build client");
    ///     client
    ///         .oauth
    ///         .get_token(
    ///             &GetTokenRequest {
    ///                 client_id: "client_id".to_string(),
    ///                 client_secret: "client_secret".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_token(
        &self,
        request: &GetTokenRequest,
        options: Option<RequestOptions>,
    ) -> Result<GetTokenResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "oauth/token",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
