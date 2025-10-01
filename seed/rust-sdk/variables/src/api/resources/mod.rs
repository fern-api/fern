use crate::{ApiError, ClientConfig};

pub mod service;
pub struct VariablesClient {
    pub config: ClientConfig,
    pub service: ServiceClient,
}

impl VariablesClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            service: ServiceClient::new(config.clone())?,
        })
    }
}

pub use service::*;
