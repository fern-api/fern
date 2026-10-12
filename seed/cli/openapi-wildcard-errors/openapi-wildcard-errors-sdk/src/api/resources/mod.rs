//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Items**

use crate::{ApiError, ClientConfig};

pub mod items;
pub struct ApiClient {
    pub config: ClientConfig,
    pub items: ItemsClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            items: ItemsClient::new(config.clone())?,
        })
    }
}

pub use items::ItemsClient;
