use crate::{ApiError, ClientConfig};

pub mod basic_auth;
pub mod errors;
pub struct BasicAuthClient {
    pub config: ClientConfig,
    pub basic_auth: BasicAuthClient,
}

impl BasicAuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            basic_auth: BasicAuthClient::new(config.clone())?,
        })
    }
}

pub use basic_auth::*;
pub use errors::*;
