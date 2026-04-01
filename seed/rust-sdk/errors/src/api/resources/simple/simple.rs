use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct SimpleClient {
    pub http_client: HttpClient,
}

impl SimpleClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn foo_without_endpoint_error(
        &self,
        request: &FooRequest,
        options: Option<RequestOptions>,
    ) -> Result<FooResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "foo1",
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
    pub async fn foo_without_endpoint_error_with_raw_response(
        &self,
        request: &FooRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<FooResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "foo1",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn foo(
        &self,
        request: &FooRequest,
        options: Option<RequestOptions>,
    ) -> Result<FooResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "foo2",
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
    pub async fn foo_with_raw_response(
        &self,
        request: &FooRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<FooResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "foo2",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn foo_with_examples(
        &self,
        request: &FooRequest,
        options: Option<RequestOptions>,
    ) -> Result<FooResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "foo3",
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
    pub async fn foo_with_examples_with_raw_response(
        &self,
        request: &FooRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<FooResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "foo3",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
