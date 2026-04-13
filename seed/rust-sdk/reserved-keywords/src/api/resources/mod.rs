//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Package**

use crate::{ApiError, ClientConfig};

pub mod package;
pub struct ApiClient {
    pub config: ClientConfig,
    pub package: PackageClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            package: PackageClient::new(config.clone())?,
        })
    }
}

pub use package::PackageClient;
