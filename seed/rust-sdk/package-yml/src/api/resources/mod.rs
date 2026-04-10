//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - ****
//! - **Service**

use crate::{ClientConfig, ApiError};

pub mod ;
pub mod service;
pub struct ApiClient {
    pub config: ClientConfig,
    pub : Client,
    pub service: ServiceClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            : Client::new(config.clone())?,
            service: ServiceClient::new(config.clone())?
        })
    }

}

pub use ::Client;
pub use service::ServiceClient;
