//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct RustUnionBasePropertiesClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
}

impl RustUnionBasePropertiesClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_rust_union_base_properties::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = RustUnionBasePropertiesClient::new(config).expect("Failed to build client");
    ///     client.get(None).await;
    /// }
    /// ```
    pub async fn get(&self, options: Option<RequestOptions>) -> Result<ErrorResponse, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/errors", None, None, options)
            .await
    }
}
