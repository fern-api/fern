//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **V1**

use crate::{ApiError, ClientConfig};

pub mod v1;
pub struct ApiClient {
    pub config: ClientConfig,
    pub v1: V1Client,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            v1: V1Client::new(config.clone())?,
        })
    }
}

pub use v1::V1Client;
