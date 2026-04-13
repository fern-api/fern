//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Auth**
//! - **NestedApi**
//! - **Simple**

use crate::{ApiError, ClientConfig};

pub mod auth;
pub mod nested_api;
pub mod simple;
pub struct ApiClient {
    pub config: ClientConfig,
    pub auth: AuthClient,
    pub nested_api: NestedApiClient,
    pub simple: SimpleClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            auth: AuthClient::new(config.clone())?,
            nested_api: NestedApiClient::new(config.clone())?,
            simple: SimpleClient::new(config.clone())?,
        })
    }
}

pub use auth::AuthClient;
pub use nested_api::NestedApiClient;
pub use simple::SimpleClient;
