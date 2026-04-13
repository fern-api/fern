//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Auth**
//! - **NestedNoAuthApi**
//! - **NestedApi**
//! - **Service**
//! - **Simple**

use crate::{ApiError, ClientConfig};

pub mod auth;
pub mod nested_api;
pub mod nested_no_auth_api;
pub mod service;
pub mod simple;
pub struct ApiClient {
    pub config: ClientConfig,
    pub auth: AuthClient,
    pub nested_no_auth_api: NestedNoAuthApiClient,
    pub nested_api: NestedApiClient,
    pub service: ServiceClient,
    pub simple: SimpleClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            auth: AuthClient::new(config.clone())?,
            nested_no_auth_api: NestedNoAuthApiClient::new(config.clone())?,
            nested_api: NestedApiClient::new(config.clone())?,
            service: ServiceClient::new(config.clone())?,
            simple: SimpleClient::new(config.clone())?,
        })
    }
}

pub use auth::AuthClient;
pub use nested_api::NestedApiClient;
pub use nested_no_auth_api::NestedNoAuthApiClient;
pub use service::ServiceClient;
pub use simple::SimpleClient;
