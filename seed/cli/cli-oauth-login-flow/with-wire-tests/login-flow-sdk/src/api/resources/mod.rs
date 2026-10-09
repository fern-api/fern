//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Widgets**
//! - **Tokens**
//! - **System**

use crate::{ApiError, ClientConfig};

pub mod system;
pub mod tokens;
pub mod widgets;
pub struct ApiClient {
    pub config: ClientConfig,
    pub widgets: WidgetsClient,
    pub tokens: TokensClient,
    pub system: SystemClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            widgets: WidgetsClient::new(config.clone())?,
            tokens: TokensClient::new(config.clone())?,
            system: SystemClient::new(config.clone())?,
        })
    }
}

pub use system::SystemClient;
pub use tokens::TokensClient;
pub use widgets::WidgetsClient;
