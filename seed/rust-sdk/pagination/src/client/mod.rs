use crate::{ClientConfig, ClientError};

pub mod complex;
pub mod users;
pub struct PaginationClient {
    pub config: ClientConfig,
    pub complex: ComplexClient,
    pub users: UsersClient,
}

impl PaginationClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        Ok(Self {
            config: config.clone(),
            complex: ComplexClient::new(config.clone())?,
            users: UsersClient::new(config.clone())?
        })
    }

}

pub use complex::ComplexClient;
pub use users::UsersClient;
