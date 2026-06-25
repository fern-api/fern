//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Service**
//! - **Types**

use crate::{ApiError, ClientConfig};

pub mod service;
pub mod types;
pub struct ApiClient {
    pub config: ClientConfig,
    pub service: ServiceClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            service: ServiceClient::new(config.clone())?,
        })
    }
}

pub use service::ServiceClient;
pub use types::TypesClient;
