//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Knowledge**
//! - **Messages**

use crate::{ApiError, ClientConfig};

pub mod knowledge;
pub mod messages;
pub struct ApiClient {
    pub config: ClientConfig,
    pub knowledge: KnowledgeClient,
    pub messages: MessagesClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            knowledge: KnowledgeClient::new(config.clone())?,
            messages: MessagesClient::new(config.clone())?,
        })
    }
}

pub use knowledge::KnowledgeClient;
pub use messages::MessagesClient;
