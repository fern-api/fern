//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Nullable**

use crate::{ApiError, ClientConfig};

pub mod nullable;
pub struct ApiClient {
    pub config: ClientConfig,
    pub nullable: NullableClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            nullable: NullableClient::new(config.clone())?,
        })
    }
}

pub use nullable::NullableClient;
