//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Auth**
//! - **NestedNoAuth**
//! - **Nested**
//! - **Simple**

use crate::{ApiError, ClientConfig};

pub mod auth;
pub mod nested;
pub mod nested_no_auth;
pub mod simple;
pub struct OauthClientCredentialsClient {
    pub config: ClientConfig,
    pub auth: AuthClient,
    pub nested_no_auth: NestedNoAuthClient,
    pub nested: NestedClient,
    pub simple: SimpleClient,
}

impl OauthClientCredentialsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            auth: AuthClient::new(config.clone())?,
            nested_no_auth: NestedNoAuthClient::new(config.clone())?,
            nested: NestedClient::new(config.clone())?,
            simple: SimpleClient::new(config.clone())?,
        })
    }
}

pub use auth::AuthClient;
pub use nested::NestedClient;
pub use nested_no_auth::NestedNoAuthClient;
pub use simple::SimpleClient;
