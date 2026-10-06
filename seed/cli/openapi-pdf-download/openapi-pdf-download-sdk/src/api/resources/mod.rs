//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **AssetReport**

use crate::{ApiError, ClientConfig};

pub mod asset_report;
pub struct ApiClient {
    pub config: ClientConfig,
    pub asset_report: AssetReportClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            asset_report: AssetReportClient::new(config.clone())?,
        })
    }
}

pub use asset_report::AssetReportClient;
