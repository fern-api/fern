//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Imdb**

use crate::{ApiError, ClientConfig};

pub mod imdb;
pub struct CustomImdbClient {
    pub config: ClientConfig,
    pub imdb: ImdbClient,
}

impl CustomImdbClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            imdb: ImdbClient::new(config.clone())?,
        })
    }
}

pub use imdb::ImdbClient;
