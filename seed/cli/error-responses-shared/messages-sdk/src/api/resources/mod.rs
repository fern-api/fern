//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Calls**
//! - **Messages**

use crate::{ApiError, ClientConfig};

pub mod calls;
pub mod messages;
pub struct ApiClient {
    pub config: ClientConfig,
    pub calls: CallsClient,
    pub messages: MessagesClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            calls: CallsClient::new(config.clone())?,
            messages: MessagesClient::new(config.clone())?,
        })
    }
}

pub use calls::CallsClient;
pub use messages::MessagesClient;
