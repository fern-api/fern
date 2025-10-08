use crate::{ApiError, ClientConfig};

pub mod service;
pub struct ResponsePropertyClient {
    pub config: ClientConfig,
    pub service: ServiceClient,
}

impl ResponsePropertyClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            service: ServiceClient::new(config.clone())?,
        })
    }
}

pub use service::ServiceClient;
