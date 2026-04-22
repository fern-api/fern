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
}
