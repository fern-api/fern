//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **RealtimeNoAuth**
//! - **Realtime**

use crate::{ClientConfig, ApiError};

pub mod realtime_no_auth;
pub mod realtime;
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

pub use realtime_no_auth::RealtimeNoAuthClient;
pub use realtime::RealtimeClient;
