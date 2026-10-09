//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Conversations**
//! - **Users**

use crate::{ApiError, ClientConfig};

pub mod conversations;
pub mod users;
pub struct ApiClient {
    pub config: ClientConfig,
    pub conversations: ConversationsClient,
    pub users: UsersClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            conversations: ConversationsClient::new(config.clone())?,
            users: UsersClient::new(config.clone())?,
        })
    }
}

pub use conversations::ConversationsClient;
pub use users::UsersClient;
