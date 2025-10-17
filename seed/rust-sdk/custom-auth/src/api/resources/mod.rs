use crate::{ApiError, ClientConfig};

pub mod custom_auth;
pub mod errors;
pub struct CustomAuthClient {
    pub config: ClientConfig,
    pub custom_auth: CustomAuthClient2,
}

impl CustomAuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            custom_auth: CustomAuthClient2::new(config.clone())?,
        })
    }
}

pub use custom_auth::CustomAuthClient2;
pub use errors::ErrorsClient;
