//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **RealtimeNoAuth**
//! - **Realtime**

use crate::{ApiError, ClientConfig};

pub mod realtime;
pub mod realtime_no_auth;
pub struct WebsocketBearerAuthClient {
    pub config: ClientConfig,
}

impl WebsocketBearerAuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
        })
    }
}

pub use realtime::RealtimeClient;
pub use realtime_no_auth::RealtimeNoAuthClient;
