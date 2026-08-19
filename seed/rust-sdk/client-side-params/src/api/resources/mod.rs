//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Service**
//! - **Types**

use crate::{ApiError, ClientConfig};

pub mod service;
pub mod types;
pub struct ClientSideParamsClient {
    pub config: ClientConfig,
    pub service: ServiceClient,
}

impl ClientSideParamsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            service: ServiceClient::new(config.clone())?,
        })
    }
}

pub use service::ServiceClient;
pub use types::TypesClient;
