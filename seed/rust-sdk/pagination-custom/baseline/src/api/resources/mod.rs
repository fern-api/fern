//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Users**

use crate::{ApiError, ClientConfig};

pub mod users;
pub struct PaginationClient {
    pub config: ClientConfig,
    pub users: UsersClient,
}

impl PaginationClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            users: UsersClient::new(config.clone())?,
        })
    }
}

pub use users::UsersClient;
