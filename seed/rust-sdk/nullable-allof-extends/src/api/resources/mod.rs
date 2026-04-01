//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ApiClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Returns a RootObject which inherits from a nullable schema.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn get_test(&self, options: Option<RequestOptions>) -> Result<RootObject, ApiError> {
        self.http_client
            .execute_request(Method::GET, "test", None, None, options)
            .await
    }

    /// Returns a RootObject which inherits from a nullable schema.
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
    pub async fn get_test_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<RootObject>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(Method::GET, "test", None, None, options)
            .await
    }

    /// Creates a test object with nullable allOf in request body.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn create_test(
        &self,
        request: &RootObject,
        options: Option<RequestOptions>,
    ) -> Result<RootObject, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "test",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Creates a test object with nullable allOf in request body.
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
    pub async fn create_test_with_raw_response(
        &self,
        request: &RootObject,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<RootObject>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "test",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
