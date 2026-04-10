//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Basicauth**

use crate::{ApiError, ClientConfig};

pub mod basicauth;
pub struct ApiClient {
    pub config: ClientConfig,
    pub basicauth: BasicauthClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            basicauth: BasicauthClient::new(config.clone())?,
        })
    }
}

pub use basicauth::BasicauthClient;
