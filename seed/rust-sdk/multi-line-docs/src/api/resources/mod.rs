use crate::{ApiError, ClientConfig};

pub mod user;
pub struct MultiLineDocsClient {
    pub config: ClientConfig,
    pub user: UserClient,
}

impl MultiLineDocsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            user: UserClient::new(config.clone())?,
        })
    }
}

pub use user::UserClient;
