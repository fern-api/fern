//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Auth**

use crate::{ApiError, ClientConfig};

pub mod auth;
pub struct ApiClient {
    pub config: ClientConfig,
    pub auth: AuthClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            auth: AuthClient::new(config.clone())?,
        })
    }
}

pub use auth::AuthClient;
