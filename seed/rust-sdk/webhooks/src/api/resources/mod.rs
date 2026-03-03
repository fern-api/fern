//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::{ApiError, ClientConfig};

pub struct WebhooksClient {
    pub config: ClientConfig,
}

impl WebhooksClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
        })
    }
}
