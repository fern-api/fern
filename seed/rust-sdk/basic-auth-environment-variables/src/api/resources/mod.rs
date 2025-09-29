use crate::{ApiError, ClientConfig};

pub mod basic_auth;
pub mod errors;
pub struct BasicAuthEnvironmentVariablesClient {
    pub config: ClientConfig,
    pub basic_auth: BasicAuthClient,
}

impl BasicAuthEnvironmentVariablesClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            basic_auth: BasicAuthClient::new(config.clone())?,
        })
    }
}

pub use basic_auth::*;
pub use errors::*;
