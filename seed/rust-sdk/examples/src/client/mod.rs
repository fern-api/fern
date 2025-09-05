use crate::{ClientConfig, ApiError};

pub mod file;
pub mod health;
pub mod service;
pub struct ExamplesClient {
    pub config: ClientConfig,
    pub file: FileClient,
    pub health: HealthClient,
    pub service: ServiceClient,
}

impl ExamplesClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            file: FileClient::new(config.clone())?,
            health: HealthClient::new(config.clone())?,
            service: ServiceClient::new(config.clone())?
        })
    }

}

pub use file::FileClient;
pub use health::HealthClient;
pub use service::ServiceClient;
