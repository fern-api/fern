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
