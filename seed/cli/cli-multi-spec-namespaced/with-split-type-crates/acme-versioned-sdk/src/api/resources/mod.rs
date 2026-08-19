//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **V1**
//! - **V2**

use crate::{ApiError, ClientConfig};

pub mod v1;
pub mod v2;
pub struct ApiClient {
    pub config: ClientConfig,
    pub v1: V1Client,
    pub v2: V2Client,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            v1: V1Client::new(config.clone())?,
            v2: V2Client::new(config.clone())?,
        })
    }
}

pub use v1::V1Client;
pub use v2::V2Client;
