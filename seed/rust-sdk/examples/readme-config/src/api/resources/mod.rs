//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **FileNotificationService**
//! - **FileService**
//! - **HealthService**
//! - **Service**

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub mod file_notification_service;
pub mod file_service;
pub mod health_service;
pub mod service;
pub struct ApiClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
    pub file_notification_service: FileNotificationServiceClient,
    pub file_service: FileServiceClient,
    pub health_service: HealthServiceClient,
    pub service: ServiceClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
            file_notification_service: FileNotificationServiceClient::new(config.clone())?,
            file_service: FileServiceClient::new(config.clone())?,
            health_service: HealthServiceClient::new(config.clone())?,
            service: ServiceClient::new(config.clone())?,
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
                "echo",
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
                "type",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}

pub use file_notification_service::FileNotificationServiceClient;
pub use file_service::FileServiceClient;
pub use health_service::HealthServiceClient;
pub use service::ServiceClient;
