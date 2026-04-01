//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::api::websocket::{RealtimeConnector, RealtimeNoAuthConnector};
use crate::{ApiError, ClientConfig};

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
                config
                    .api_key
                    .as_ref()
                    .map(|k| k.to_string())
                    .or_else(|| config.token.as_ref().map(|t| format!("Bearer {}", t))),
            ),
            realtime: RealtimeConnector::new(
                config.base_url.clone(),
                config
                    .api_key
                    .as_ref()
                    .map(|k| k.to_string())
                    .or_else(|| config.token.as_ref().map(|t| format!("Bearer {}", t))),
            ),
        })
    }
}
