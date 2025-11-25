//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Realtime**

use crate::{ApiError, ClientConfig};

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

pub use realtime::RealtimeClient;
