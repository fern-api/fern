//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Unknown**

use crate::{ApiError, ClientConfig};

pub mod unknown;
pub struct UnknownAsAnyClient {
    pub config: ClientConfig,
    pub unknown: UnknownClient,
}

impl UnknownAsAnyClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            unknown: UnknownClient::new(config.clone())?,
        })
    }
}

pub use unknown::UnknownClient;
