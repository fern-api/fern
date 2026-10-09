//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Widgets**

use crate::{ApiError, ClientConfig};

pub mod widgets;
pub struct ApiClient {
    pub config: ClientConfig,
    pub widgets: WidgetsClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            widgets: WidgetsClient::new(config.clone())?,
        })
    }
}

pub use widgets::WidgetsClient;
