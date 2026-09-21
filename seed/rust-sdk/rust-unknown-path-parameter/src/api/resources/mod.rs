//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct RustUnknownPathParameterClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
}

impl RustUnknownPathParameterClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_rust_unknown_path_parameter::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = RustUnknownPathParameterClient::new(config).expect("Failed to build client");
    ///     client.get(&serde_json::json!("abc"), None).await;
    /// }
    /// ```
    pub async fn get(
        &self,
        resource_id: &serde_json::Value,
        options: Option<RequestOptions>,
    ) -> Result<Resource, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!(
                    "resources/{}",
                    resource_id
                        .as_str()
                        .map(str::to_owned)
                        .unwrap_or_else(|| resource_id.to_string())
                ),
                None,
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_rust_unknown_path_parameter::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = RustUnknownPathParameterClient::new(config).expect("Failed to build client");
    ///     client
    ///         .get_by_alias(&ResourceId(serde_json::json!("abc")), None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_by_alias(
        &self,
        resource_id: &ResourceId,
        options: Option<RequestOptions>,
    ) -> Result<Resource, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!(
                    "aliased-resources/{}",
                    resource_id
                        .0
                        .as_str()
                        .map(str::to_owned)
                        .unwrap_or_else(|| resource_id.0.to_string())
                ),
                None,
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_rust_unknown_path_parameter::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = RustUnknownPathParameterClient::new(config).expect("Failed to build client");
    ///     client
    ///         .get_by_alias_chain(&ResourceKey(ResourceId(serde_json::json!("abc"))), None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_by_alias_chain(
        &self,
        resource_id: &ResourceKey,
        options: Option<RequestOptions>,
    ) -> Result<Resource, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!(
                    "chained-resources/{}",
                    resource_id
                        .0
                         .0
                        .as_str()
                        .map(str::to_owned)
                        .unwrap_or_else(|| resource_id.0 .0.to_string())
                ),
                None,
                None,
                options,
            )
            .await
    }
}
