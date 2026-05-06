//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Testgroup**

use crate::{ApiError, ClientConfig};

pub mod testgroup;
pub struct ApiClient {
    pub config: ClientConfig,
    pub testgroup: TestgroupClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            testgroup: TestgroupClient::new(config.clone())?,
        })
    }
}

pub use testgroup::TestgroupClient;
