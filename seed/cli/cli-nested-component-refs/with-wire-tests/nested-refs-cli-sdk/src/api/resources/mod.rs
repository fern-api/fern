//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Orders**
//! - **Shipments**

use crate::{ApiError, ClientConfig};

pub mod orders;
pub mod shipments;
pub struct ApiClient {
    pub config: ClientConfig,
    pub orders: OrdersClient,
    pub shipments: ShipmentsClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            orders: OrdersClient::new(config.clone())?,
            shipments: ShipmentsClient::new(config.clone())?,
        })
    }
}

pub use orders::OrdersClient;
pub use shipments::ShipmentsClient;
