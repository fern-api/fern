//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct LiteralUserAgentClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
}

impl LiteralUserAgentClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_literal_user_agent::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = LiteralUserAgentClient::new(config).expect("Failed to build client");
    ///     client.ping(None).await;
    /// }
    /// ```
    pub async fn ping(&self, options: Option<RequestOptions>) -> Result<String, ApiError> {
        let options = {
            let mut o = options.unwrap_or_default();
            o.additional_headers
                .entry("user-agent".to_string())
                .or_insert_with(|| "my-sdk".to_string());
            Some(o)
        };
        self.http_client
            .execute_request(Method::GET, "ping", None, None, options)
            .await
    }
}
