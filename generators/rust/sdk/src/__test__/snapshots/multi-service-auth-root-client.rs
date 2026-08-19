use crate::{ClientConfig, ApiError};

pub mod user;
pub mod admin;
pub struct TestClient {
    pub config: ClientConfig,
    pub user: Client,
    pub admin: Client,
}

impl TestClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            user: Client::new(config.clone())?,
            admin: Client::new(config.clone())?
        })
    }

}

pub use user::*;
pub use admin::*;
