//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Oauth**

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub mod oauth;
pub struct ApiClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
    pub oauth: OauthClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
            oauth: OauthClient::new(config.clone())?,
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
    ///     client.list_items(None).await;
    /// }
    /// ```
    pub async fn list_items(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<String>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "items", None, None, options)
            .await
    }
}

pub use oauth::OauthClient;
