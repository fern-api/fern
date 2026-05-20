//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Completions**

use crate::{ApiError, ClientConfig};

pub mod completions;
pub struct ServerSentEventsResumableClient {
    pub config: ClientConfig,
    pub completions: CompletionsClient,
}

impl ServerSentEventsResumableClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            completions: CompletionsClient::new(config.clone())?,
        })
    }
}

pub use completions::CompletionsClient;
