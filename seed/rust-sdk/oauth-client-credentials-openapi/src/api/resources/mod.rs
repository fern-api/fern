//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Identity**
//! - **Plants**

use crate::{ApiError, ClientConfig};

pub mod identity;
pub mod plants;
pub struct ApiClient {
    pub config: ClientConfig,
    pub identity: IdentityClient,
    pub plants: PlantsClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            identity: IdentityClient::new(config.clone())?,
            plants: PlantsClient::new(config.clone())?,
        })
    }
}

pub use identity::IdentityClient;
pub use plants::PlantsClient;
