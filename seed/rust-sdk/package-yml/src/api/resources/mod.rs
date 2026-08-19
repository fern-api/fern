//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Service**

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub mod service;
pub struct PackageYmlClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
    pub service: ServiceClient,
}

impl PackageYmlClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
            service: ServiceClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_package_yml::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = PackageYmlClient::new(config).expect("Failed to build client");
    ///     client
    ///         .echo(
    ///             &"id-ksfd9c1".to_string(),
    ///             &EchoRequest {
    ///                 name: "Hello world!".to_string(),
    ///                 size: 20,
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn echo(
        &self,
        id: &str,
        request: &EchoRequest,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("/{}/", id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}

pub use service::ServiceClient;
