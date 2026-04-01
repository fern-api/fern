//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct LicenseClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
}

impl LicenseClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client
            .execute_request(Method::GET, "/", None, None, options)
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
    pub async fn get_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<()>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(Method::GET, "/", None, None, options)
            .await
    }
}
