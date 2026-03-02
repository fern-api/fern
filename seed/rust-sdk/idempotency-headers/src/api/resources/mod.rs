//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Payment**

use crate::{ApiError, ClientConfig};

pub mod payment;
pub struct IdempotencyHeadersClient {
    pub config: ClientConfig,
    pub payment: PaymentClient,
}

impl IdempotencyHeadersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            payment: PaymentClient::new(config.clone())?,
        })
    }
}

pub use payment::PaymentClient;
