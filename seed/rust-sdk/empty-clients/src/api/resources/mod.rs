//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Level1**

use crate::{ApiError, ClientConfig};

pub mod level1;
pub struct EmptyClientsClient {
    pub config: ClientConfig,
}

impl EmptyClientsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
        })
    }
}

pub use level1::Level1Client;
