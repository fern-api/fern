use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct NoAuthClient {
    pub http_client: HttpClient,
}

impl NoAuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// POST request with no auth
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn post_with_no_auth(
        &self,
        request: &serde_json::Value,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/no-auth",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// POST request with no auth
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn post_with_no_auth_with_raw_response(
        &self,
        request: &serde_json::Value,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<bool>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/no-auth",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
