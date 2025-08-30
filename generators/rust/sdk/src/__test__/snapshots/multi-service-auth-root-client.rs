use crate::{ClientConfig, ApiError};

pub mod user;
pub mod admin;
pub struct TestClient {
    pub config: ClientConfig,
    pub user: UserClient,
    pub admin: AdminClient,
}

impl TestClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            user: UserClient::new(config.clone())?,
            admin: AdminClient::new(config.clone())?
        })
    }

}

pub use user::UserClient;
pub use admin::AdminClient;
