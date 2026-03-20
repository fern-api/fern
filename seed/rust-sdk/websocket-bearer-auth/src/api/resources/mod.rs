//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **RealtimeNoAuth**
//! - **Realtime**

use crate::api::websocket::{RealtimeConnector, RealtimeNoAuthConnector};
use crate::{ApiError, ClientConfig};

pub mod realtime;
pub mod realtime_no_auth;
pub struct WebsocketBearerAuthClient {
    pub config: ClientConfig,
    pub realtime_no_auth: RealtimeNoAuthConnector,
    pub realtime: RealtimeConnector,
}

impl WebsocketBearerAuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            realtime_no_auth: RealtimeNoAuthConnector::new(
                config.base_url.clone(),
                config.token.clone(),
            ),
            realtime: RealtimeConnector::new(config.base_url.clone(), config.token.clone()),
        })
    }
}

pub use realtime::RealtimeClient;
pub use realtime_no_auth::RealtimeNoAuthClient;
