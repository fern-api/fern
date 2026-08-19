//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct UndiscriminatedUnionWithResponsePropertyClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
}

impl UndiscriminatedUnionWithResponsePropertyClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_undiscriminated_union_with_response_property::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = UndiscriminatedUnionWithResponsePropertyClient::new(config)
    ///         .expect("Failed to build client");
    ///     client.get_union(None).await;
    /// }
    /// ```
    pub async fn get_union(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<UnionResponse, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/union", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_undiscriminated_union_with_response_property::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = UndiscriminatedUnionWithResponsePropertyClient::new(config)
    ///         .expect("Failed to build client");
    ///     client.list_unions(None).await;
    /// }
    /// ```
    pub async fn list_unions(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<UnionListResponse, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/unions", None, None, options)
            .await
    }
}
