use crate::{ApiError, ClientConfig};

pub mod service;
pub struct BearerTokenEnvironmentVariableClient {
    pub config: ClientConfig,
    pub service: ServiceClient,
}

impl BearerTokenEnvironmentVariableClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            service: ServiceClient::new(config.clone())?,
        })
    }
}

pub use service::ServiceClient;
