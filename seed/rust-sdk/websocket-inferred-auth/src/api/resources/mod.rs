//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Auth**
//! - **Realtime**

use crate::{ApiError, ClientConfig};

pub mod auth;
pub mod realtime;
pub struct WebsocketAuthClient {
    pub config: ClientConfig,
    pub auth: AuthClient,
}

impl WebsocketAuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            auth: AuthClient::new(config.clone())?,
        })
    }
}

pub use auth::AuthClient;
pub use realtime::RealtimeClient;
