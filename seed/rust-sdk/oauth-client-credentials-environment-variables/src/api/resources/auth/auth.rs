use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
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

    /// Returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn get_token_with_client_credentials_with_raw_response(
        &self,
        request: &GetTokenRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<TokenResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/token",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

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

    /// Returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn refresh_token_with_raw_response(
        &self,
        request: &RefreshTokenRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<TokenResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/token",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
