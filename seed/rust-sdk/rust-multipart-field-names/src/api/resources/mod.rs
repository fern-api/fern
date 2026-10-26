//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Knowledge**

use crate::{ApiError, ClientConfig};

pub mod knowledge;
pub struct ApiClient {
    pub config: ClientConfig,
    pub knowledge: KnowledgeClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            knowledge: KnowledgeClient::new(config.clone())?,
        })
    }
}

pub use knowledge::KnowledgeClient;
