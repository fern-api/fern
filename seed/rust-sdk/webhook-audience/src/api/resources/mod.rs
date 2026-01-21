//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Webhooks**

use crate::{ApiError, ClientConfig};

pub mod webhooks;
pub struct ApiClient {
    pub config: ClientConfig,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
        })
    }
}

pub use webhooks::WebhooksClient;
