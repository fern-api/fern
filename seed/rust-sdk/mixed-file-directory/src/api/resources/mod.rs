//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Organization**
//! - **User**

use crate::{ApiError, ClientConfig};

pub mod organization;
pub mod user;
pub struct MixedFileDirectoryClient {
    pub config: ClientConfig,
    pub organization: OrganizationClient,
    pub user: UserClient,
}

impl MixedFileDirectoryClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            organization: OrganizationClient::new(config.clone())?,
            user: UserClient::new(config.clone())?,
        })
    }
}

pub use organization::OrganizationClient;
pub use user::UserClient;
