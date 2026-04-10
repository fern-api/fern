//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Retries**

use crate::{ApiError, ClientConfig};

pub mod retries;
pub struct ApiClient {
    pub config: ClientConfig,
    pub retries: RetriesClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            retries: RetriesClient::new(config.clone())?,
        })
    }
}

pub use retries::RetriesClient;
