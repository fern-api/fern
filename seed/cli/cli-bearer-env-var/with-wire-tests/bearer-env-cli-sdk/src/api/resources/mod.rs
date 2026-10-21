//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Widgets**
//! - **System**

use crate::{ApiError, ClientConfig};

pub mod system;
pub mod widgets;
pub struct ApiClient {
    pub config: ClientConfig,
    pub widgets: WidgetsClient,
    pub system: SystemClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            widgets: WidgetsClient::new(config.clone())?,
            system: SystemClient::new(config.clone())?,
        })
    }
}

pub use system::SystemClient;
pub use widgets::WidgetsClient;
