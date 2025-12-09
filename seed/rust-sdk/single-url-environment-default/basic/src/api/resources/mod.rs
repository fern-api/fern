//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Dummy**

use crate::{ApiError, ClientConfig};

pub mod dummy;
pub struct SingleUrlEnvironmentDefaultClient {
    pub config: ClientConfig,
    pub dummy: DummyClient,
}

impl SingleUrlEnvironmentDefaultClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            dummy: DummyClient::new(config.clone())?,
        })
    }
}

pub use dummy::DummyClient;
