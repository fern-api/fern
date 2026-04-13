//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Complex**
//! - **InlineUsersInlineUsers**
//! - **Users**

use crate::{ApiError, ClientConfig};

pub mod complex;
pub mod inline_users_inline_users;
pub mod users;
pub struct ApiClient {
    pub config: ClientConfig,
    pub complex: ComplexClient,
    pub inline_users_inline_users: InlineUsersInlineUsersClient,
    pub users: UsersClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            complex: ComplexClient::new(config.clone())?,
            inline_users_inline_users: InlineUsersInlineUsersClient::new(config.clone())?,
            users: UsersClient::new(config.clone())?,
        })
    }
}

pub use complex::ComplexClient;
pub use inline_users_inline_users::InlineUsersInlineUsersClient;
pub use users::UsersClient;
