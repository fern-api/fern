//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Empty**

use crate::{ClientConfig, ApiError};
use crate::api::websocket::{EmptyRealtimeConnector, RealtimeConnector};

pub mod empty;
pub struct WebsocketClient {
    pub config: ClientConfig,
    pub empty_realtime: EmptyRealtimeConnector,
    pub realtime: RealtimeConnector,
}

impl WebsocketClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            empty_realtime: EmptyRealtimeConnector::new(config.base_url.clone(), config.api_key.as_ref().map(|k| k.to_string()).or_else(|| config.token.as_ref().map(|t| format!("Bearer {}", t)))),
            realtime: RealtimeConnector::new(config.base_url.clone(), config.api_key.as_ref().map(|k| k.to_string()).or_else(|| config.token.as_ref().map(|t| format!("Bearer {}", t))))
        })
    }

}

pub use empty::EmptyClient;
