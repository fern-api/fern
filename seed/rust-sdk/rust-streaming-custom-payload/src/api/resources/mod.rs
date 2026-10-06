//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Chunks**
//! - **Events**

use crate::{ApiError, ClientConfig};

pub mod chunks;
pub mod events;
pub struct RustStreamingCustomPayloadClient {
    pub config: ClientConfig,
    pub chunks: ChunksClient,
    pub events: EventsClient,
}

impl RustStreamingCustomPayloadClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            chunks: ChunksClient::new(config.clone())?,
            events: EventsClient::new(config.clone())?,
        })
    }
}

pub use chunks::ChunksClient;
pub use events::EventsClient;
