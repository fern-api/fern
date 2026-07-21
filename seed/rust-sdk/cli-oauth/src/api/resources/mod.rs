//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Auth**
//! - **System**
//! - **Pets**

use crate::{ApiError, ClientConfig};

pub mod auth;
pub mod pets;
pub mod system;
pub struct ApiClient {
    pub config: ClientConfig,
    pub auth: AuthClient,
    pub system: SystemClient,
    pub pets: PetsClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            auth: AuthClient::new(config.clone())?,
            system: SystemClient::new(config.clone())?,
            pets: PetsClient::new(config.clone())?,
        })
    }
}

pub use auth::AuthClient;
pub use pets::PetsClient;
pub use system::SystemClient;
