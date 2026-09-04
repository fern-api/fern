//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Messages**

use crate::{ApiError, ClientConfig};

pub mod messages;
pub struct ApiClient {
    pub config: ClientConfig,
    pub messages: MessagesClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            messages: MessagesClient::new(config.clone())?,
        })
    }
}

pub use messages::MessagesClient;
