//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **A**
//! - **Folder**

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub mod a;
pub mod folder;
pub struct ApiClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
    pub a: AClient,
    pub folder: FolderClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
            a: AClient::new(config.clone())?,
            folder: FolderClient::new(config.clone())?,
        })
    }

    pub async fn foo(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client
            .execute_request(Method::POST, "", None, None, options)
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
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<()>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(Method::POST, "", None, None, options)
            .await
    }
}

pub use a::AClient;
pub use folder::FolderClient;
