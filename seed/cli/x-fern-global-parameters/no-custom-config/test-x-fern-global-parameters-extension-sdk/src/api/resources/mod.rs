//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Products**

use crate::{ApiError, ClientConfig};

pub mod products;
pub struct ApiClient {
    pub config: ClientConfig,
    pub products: ProductsClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            products: ProductsClient::new(config.clone())?,
        })
    }
}

pub use products::ProductsClient;
