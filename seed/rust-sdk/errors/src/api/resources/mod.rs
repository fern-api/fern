//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Simple**

use crate::{ApiError, ClientConfig};

pub mod simple;
pub struct ApiClient {
    pub config: ClientConfig,
    pub simple: SimpleClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            simple: SimpleClient::new(config.clone())?,
        })
    }
}

pub use simple::SimpleClient;
