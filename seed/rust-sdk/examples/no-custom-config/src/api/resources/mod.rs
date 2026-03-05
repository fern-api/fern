//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Commons**
//! - **File**
//! - **Health**
//! - **Service**
//! - **Types**

use crate::{ApiError, ClientConfig};

pub mod commons;
pub mod file;
pub mod health;
pub mod service;
pub mod types;
pub struct ExamplesClient {
    pub config: ClientConfig,
    pub file: FileClient,
    pub health: HealthClient,
    pub service: ServiceClient4,
}

impl ExamplesClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            file: FileClient::new(config.clone())?,
            health: HealthClient::new(config.clone())?,
            service: ServiceClient4::new(config.clone())?,
        })
    }
}

pub use commons::CommonsClient;
pub use file::FileClient;
pub use health::HealthClient;
pub use service::ServiceClient4;
pub use types::TypesClient2;
