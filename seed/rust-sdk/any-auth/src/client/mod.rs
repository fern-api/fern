use crate::{ClientConfig, ApiError};

pub mod auth;
pub mod user;
pub struct AnyAuthClient {
    pub config: ClientConfig,
    pub auth: AuthClient,
    pub user: UserClient,
}

impl AnyAuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            auth: AuthClient::new(config.clone())?,
            user: UserClient::new(config.clone())?
        })
    }

}

pub use auth::AuthClient;
pub use user::UserClient;
