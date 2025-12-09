//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Commons**
//! - **Simple**

use crate::{ApiError, ClientConfig};

pub mod commons;
pub mod simple;
pub struct ErrorsClient {
    pub config: ClientConfig,
    pub simple: SimpleClient,
}

impl ErrorsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            simple: SimpleClient::new(config.clone())?,
        })
    }
}

pub use commons::CommonsClient;
pub use simple::SimpleClient;
