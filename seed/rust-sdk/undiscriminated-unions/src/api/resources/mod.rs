//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Union**

use crate::{ApiError, ClientConfig};

pub mod union_;
pub struct ApiClient {
    pub config: ClientConfig,
    pub union_: UnionClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            union_: UnionClient::new(config.clone())?,
        })
    }
}

pub use union_::UnionClient;
