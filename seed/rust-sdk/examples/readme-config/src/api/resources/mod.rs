//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - ****
//! - **FileNotificationService**
//! - **FileService**
//! - **HealthService**
//! - **Service**

use crate::{ClientConfig, ApiError};

pub mod ;
pub mod file_notification_service;
pub mod file_service;
pub mod health_service;
pub mod service;
pub struct ApiClient {
    pub config: ClientConfig,
    pub : Client,
    pub file_notification_service: FileNotificationServiceClient,
    pub file_service: FileServiceClient,
    pub health_service: HealthServiceClient,
    pub service: ServiceClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            : Client::new(config.clone())?,
            file_notification_service: FileNotificationServiceClient::new(config.clone())?,
            file_service: FileServiceClient::new(config.clone())?,
            health_service: HealthServiceClient::new(config.clone())?,
            service: ServiceClient::new(config.clone())?
        })
    }

}

pub use ::Client;
pub use file_notification_service::FileNotificationServiceClient;
pub use file_service::FileServiceClient;
pub use health_service::HealthServiceClient;
pub use service::ServiceClient;
