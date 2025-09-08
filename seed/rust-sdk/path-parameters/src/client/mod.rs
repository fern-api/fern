use crate::{ClientConfig, ApiError};

pub mod organizations;
pub mod user;
pub struct PathParametersClient {
    pub config: ClientConfig,
    pub organizations: OrganizationsClient,
    pub user: UserClient,
}

impl PathParametersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            organizations: OrganizationsClient::new(config.clone())?,
            user: UserClient::new(config.clone())?
        })
    }

}

pub use organizations::OrganizationsClient;
pub use user::UserClient;
