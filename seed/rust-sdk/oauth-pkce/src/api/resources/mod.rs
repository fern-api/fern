//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Oauth**

use crate::{ApiError, ClientConfig};

pub mod oauth;
pub struct OauthPkceClient {
    pub config: ClientConfig,
    pub oauth: OauthClient,
}

impl OauthPkceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            oauth: OauthClient::new(config.clone())?,
        })
    }
}

pub use oauth::OauthClient;
