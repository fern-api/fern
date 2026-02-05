//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Auth**
//! - **Simple**

use crate::{ClientConfig, ApiError};

pub mod auth;
pub mod simple;
pub struct OauthClientCredentialsReferenceClient {
    pub config: ClientConfig,
    pub auth: AuthClient,
    pub simple: SimpleClient,
}

impl OauthClientCredentialsReferenceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            auth: AuthClient::new(config.clone())?,
            simple: SimpleClient::new(config.clone())?
        })
    }

}

pub use auth::AuthClient;
pub use simple::SimpleClient;
