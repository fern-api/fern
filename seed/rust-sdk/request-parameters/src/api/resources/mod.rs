use crate::{ApiError, ClientConfig};

pub mod user;
pub struct RequestParametersClient {
    pub config: ClientConfig,
    pub user: UserClient,
}

impl RequestParametersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            user: UserClient::new(config.clone())?,
        })
    }
}

pub use user::UserClient;
