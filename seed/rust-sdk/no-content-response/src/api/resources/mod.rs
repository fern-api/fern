//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Contacts**

use crate::{ApiError, ClientConfig};

pub mod contacts;
pub struct ApiClient {
    pub config: ClientConfig,
    pub contacts: ContactsClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            contacts: ContactsClient::new(config.clone())?,
        })
    }
}

pub use contacts::ContactsClient;
