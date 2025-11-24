//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Conversations**
//! - **InlineUsers**
//! - **Users**

use crate::{ApiError, ClientConfig};

pub mod complex;
pub mod inline_users;
pub mod users;
pub struct PaginationClient {
    pub config: ClientConfig,
    pub complex: ComplexClient,
    pub inline_users: InlineUsersClient,
    pub users: UsersClient,
}

impl PaginationClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            complex: ComplexClient::new(config.clone())?,
            inline_users: InlineUsersClient::new(config.clone())?,
            users: UsersClient::new(config.clone())?,
        })
    }
}

pub use complex::ComplexClient;
pub use inline_users::InlineUsersClient;
pub use users::UsersClient;
