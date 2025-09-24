use crate::{ApiError, ClientConfig};

pub mod custom_auth;
pub mod errors;
pub struct CustomAuthClient {
    pub config: ClientConfig,
    pub custom_auth: CustomAuthClient,
}

impl CustomAuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            custom_auth: CustomAuthClient::new(config.clone())?,
        })
    }
}

pub use custom_auth::*;
pub use errors::*;
