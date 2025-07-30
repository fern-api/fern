use crate::{ClientConfig, ClientError};

pub mod auth;
pub mod service;
pub struct OauthClientCredentialsWithVariablesClient {
    pub config: ClientConfig,
    pub auth: AuthClient,
    pub service: ServiceClient,
}

impl OauthClientCredentialsWithVariablesClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        Ok(Self {
            config: config.clone(),
            auth: AuthClient::new(config.clone())?,
            service: ServiceClient::new(config.clone())?
        })
    }

}

pub use auth::AuthClient;
pub use service::ServiceClient;
