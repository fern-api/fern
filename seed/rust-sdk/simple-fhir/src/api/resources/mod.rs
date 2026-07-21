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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_api::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client.get_account(&"account_id".to_string(), None).await;
    /// }
    /// ```
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
}
