//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Propertybasederror**

use crate::{ApiError, ClientConfig};

pub mod propertybasederror;
pub struct ApiClient {
    pub config: ClientConfig,
    pub propertybasederror: PropertybasederrorClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            propertybasederror: PropertybasederrorClient::new(config.clone())?,
        })
    }
}

pub use propertybasederror::PropertybasederrorClient;
