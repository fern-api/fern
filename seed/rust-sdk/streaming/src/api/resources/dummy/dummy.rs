use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct DummyClient {
    pub http_client: HttpClient,
}

impl DummyClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn generate_stream(
        &self,
        request: &GenerateStreamRequest,
        options: Option<RequestOptions>,
    ) -> Result<StreamResponse, ApiError> {
        self.http_client
            .execute_request::<StreamResponse>(
                Method::POST,
                "generate-stream",
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
    pub async fn generate_stream_with_raw_response(
        &self,
        request: &GenerateStreamRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<StreamResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response::<StreamResponse>(
                Method::POST,
                "generate-stream",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn generate(
        &self,
        request: &Generateequest,
        options: Option<RequestOptions>,
    ) -> Result<StreamResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "generate",
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
    pub async fn generate_with_raw_response(
        &self,
        request: &Generateequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<StreamResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "generate",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
