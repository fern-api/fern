use crate::{ApiError, ClientConfig};

pub mod errors;
pub mod property_based_error;
pub struct ErrorPropertyClient {
    pub config: ClientConfig,
    pub property_based_error: PropertyBasedErrorClient,
}

impl ErrorPropertyClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            property_based_error: PropertyBasedErrorClient::new(config.clone())?,
        })
    }
}

pub use errors::*;
pub use property_based_error::*;
