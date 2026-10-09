//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Clients**

use crate::{ApiError, ClientConfig};

pub mod clients;
pub struct ApiClient {
    pub config: ClientConfig,
    pub clients: ClientsClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            clients: ClientsClient::new(config.clone())?,
        })
    }
}

pub use clients::ClientsClient;
