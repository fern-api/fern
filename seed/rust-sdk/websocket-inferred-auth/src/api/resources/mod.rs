//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Auth**

use crate::api::websocket::RealtimeConnector;
use crate::{ApiError, ClientConfig};

pub mod auth;
pub struct WebsocketAuthClient {
    pub config: ClientConfig,
    pub auth: AuthClient,
    pub realtime: RealtimeConnector,
}

impl WebsocketAuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            auth: AuthClient::new(config.clone())?,
            realtime: RealtimeConnector::new(config.base_url.clone(), config.token.clone()),
        })
    }
}

pub use auth::AuthClient;
