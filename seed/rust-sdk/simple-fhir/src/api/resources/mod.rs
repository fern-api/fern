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

    pub async fn get_account(
        &self,
        account_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Account, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("account/{}", account_id),
                None,
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
    pub async fn get_account_with_raw_response(
        &self,
        account_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Account>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                &format!("account/{}", account_id),
                None,
                None,
                options,
            )
            .await
    }
}
