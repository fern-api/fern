//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Commons**
//! - **File**
//! - **Health**
//! - **Service**
//! - **Types**

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub mod commons;
pub mod file;
pub mod health;
pub mod service;
pub mod types;
pub struct ExamplesClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
    pub file: FileClient,
    pub health: HealthClient,
    pub service: ServiceClient4,
}

impl ExamplesClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
            file: FileClient::new(config.clone())?,
            health: HealthClient::new(config.clone())?,
            service: ServiceClient4::new(config.clone())?,
        })
    }

    pub async fn echo(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn create_type(
        &self,
        request: &Type,
        options: Option<RequestOptions>,
    ) -> Result<Identifier, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}

pub use commons::CommonsClient;
pub use file::FileClient;
pub use health::HealthClient;
pub use service::ServiceClient4;
pub use types::TypesClient2;
