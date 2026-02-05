use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::api::{*};

pub struct AuthClient {
    pub http_client: HttpClient,
}

impl AuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn get_token_with_client_credentials(&self, request: &GetTokenRequest, options: Option<RequestOptions>) -> Result<TokenResponse, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/token",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn refresh_token(&self, request: &RefreshTokenRequest, options: Option<RequestOptions>) -> Result<TokenResponse, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/token/refresh",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

