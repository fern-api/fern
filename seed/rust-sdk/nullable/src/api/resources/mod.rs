//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Nullable**

use crate::{ApiError, ClientConfig};

pub mod nullable;
pub struct NullableClient {
    pub config: ClientConfig,
    pub nullable: NullableClient2,
}

impl NullableClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            nullable: NullableClient2::new(config.clone())?,
        })
    }
}

pub use nullable::NullableClient2;
