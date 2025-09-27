use crate::{ApiError, ClientConfig};

pub mod service;
pub struct PackageYmlClient {
    pub config: ClientConfig,
    pub service: ServiceClient,
}

impl PackageYmlClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            service: ServiceClient::new(config.clone())?,
        })
    }
}

pub use service::*;
