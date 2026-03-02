//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Literals**

use crate::{ApiError, ClientConfig};

pub mod literals;
pub struct LiteralsUnionsClient {
    pub config: ClientConfig,
}

impl LiteralsUnionsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
        })
    }
}

pub use literals::LiteralsClient;
