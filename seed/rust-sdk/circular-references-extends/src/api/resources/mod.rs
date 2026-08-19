//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Common**
//! - **Derived**

use crate::{ApiError, ClientConfig};

pub mod common;
pub mod derived;
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

pub use common::CommonClient;
pub use derived::DerivedClient;
