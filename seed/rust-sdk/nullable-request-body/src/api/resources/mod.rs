//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **TestGroup**

use crate::{ApiError, ClientConfig};

pub mod test_group;
pub struct ApiClient {
    pub config: ClientConfig,
    pub test_group: TestGroupClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            test_group: TestGroupClient::new(config.clone())?,
        })
    }
}

pub use test_group::TestGroupClient;
