//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Realtime**

use crate::{ApiError, ClientConfig};

pub mod empty;
pub mod realtime;
pub struct WebsocketClient {
    pub config: ClientConfig,
}

impl WebsocketClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
        })
    }
}

pub use empty::EmptyClient;
pub use realtime::RealtimeClient;
