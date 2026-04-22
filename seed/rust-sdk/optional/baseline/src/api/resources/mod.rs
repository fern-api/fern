//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Optional**

use crate::{ApiError, ClientConfig};

pub mod optional;
pub struct ObjectsWithImportsClient {
    pub config: ClientConfig,
    pub optional: OptionalClient,
}

impl ObjectsWithImportsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            optional: OptionalClient::new(config.clone())?,
        })
    }
}

pub use optional::OptionalClient;
