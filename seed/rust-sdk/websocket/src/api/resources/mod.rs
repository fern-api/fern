//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Empty**
//! - **Realtime**

use crate::api::websocket::{EmptyRealtimeConnector, RealtimeConnector};
use crate::{ApiError, ClientConfig};

pub mod empty;
pub mod realtime;
pub struct WebsocketClient {
    pub config: ClientConfig,
    pub empty_realtime: EmptyRealtimeConnector,
    pub realtime: RealtimeConnector,
}

impl WebsocketClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            empty_realtime: EmptyRealtimeConnector::new(
                config.base_url.clone(),
                config.token.clone(),
            ),
            realtime: RealtimeConnector::new(config.base_url.clone(), config.token.clone()),
        })
    }
}

pub use empty::EmptyClient;
pub use realtime::RealtimeClient;
