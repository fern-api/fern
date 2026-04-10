//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - ****

use crate::{ClientConfig, ApiError};

pub mod ;
pub struct ApiClient {
    pub config: ClientConfig,
    pub : Client,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            : Client::new(config.clone())?
        })
    }

}

pub use ::Client;
