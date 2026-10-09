//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Models**

use crate::{ApiError, ClientConfig};

pub mod models;
pub struct ApiClient {
    pub config: ClientConfig,
    pub models: ModelsClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            models: ModelsClient::new(config.clone())?,
        })
    }
}

pub use models::ModelsClient;
