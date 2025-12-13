//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Auth**
//! - **Nested**
//! - **Simple**

use crate::{ApiError, ClientConfig};

pub mod auth;
pub mod nested;
pub mod simple;
pub struct OauthClientCredentialsMandatoryAuthClient {
    pub config: ClientConfig,
    pub auth: AuthClient,
    pub nested: NestedClient,
    pub simple: SimpleClient,
}

impl OauthClientCredentialsMandatoryAuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            auth: AuthClient::new(config.clone())?,
            nested: NestedClient::new(config.clone())?,
            simple: SimpleClient::new(config.clone())?,
        })
    }
}

pub use auth::AuthClient;
pub use nested::NestedClient;
pub use simple::SimpleClient;
