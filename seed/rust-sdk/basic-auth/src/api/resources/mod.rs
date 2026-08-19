//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **BasicAuth**
//! - **Errors**

use crate::{ApiError, ClientConfig};

pub mod basic_auth;
pub mod errors;
pub struct BasicAuthClient {
    pub config: ClientConfig,
    pub basic_auth: BasicAuthClient2,
}

impl BasicAuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            basic_auth: BasicAuthClient2::new(config.clone())?,
        })
    }
}

pub use basic_auth::BasicAuthClient2;
pub use errors::ErrorsClient;
