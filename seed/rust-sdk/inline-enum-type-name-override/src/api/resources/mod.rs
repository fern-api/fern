//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Reporting**

use crate::{ApiError, ClientConfig};

pub mod reporting;
pub struct ApiClient {
    pub config: ClientConfig,
    pub reporting: ReportingClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            reporting: ReportingClient::new(config.clone())?,
        })
    }
}

pub use reporting::ReportingClient;
