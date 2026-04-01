use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct UnknownClient {
    pub http_client: HttpClient,
}

impl UnknownClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn post(
        &self,
        request: &serde_json::Value,
        options: Option<RequestOptions>,
    ) -> Result<Vec<serde_json::Value>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "",
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
    pub async fn post_with_raw_response(
        &self,
        request: &serde_json::Value,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Vec<serde_json::Value>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn post_object(
        &self,
        request: &MyObject,
        options: Option<RequestOptions>,
    ) -> Result<Vec<serde_json::Value>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/with-object",
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
    pub async fn post_object_with_raw_response(
        &self,
        request: &MyObject,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Vec<serde_json::Value>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/with-object",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
