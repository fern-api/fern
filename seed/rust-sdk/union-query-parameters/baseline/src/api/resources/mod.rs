//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Events**

use crate::{ApiError, ClientConfig};

pub mod events;
pub struct UnionQueryParametersClient {
    pub config: ClientConfig,
    pub events: EventsClient,
}

impl UnionQueryParametersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            events: EventsClient::new(config.clone())?,
        })
    }
}

pub use events::EventsClient;
