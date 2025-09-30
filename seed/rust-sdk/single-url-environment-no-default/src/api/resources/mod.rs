use crate::{ApiError, ClientConfig};

pub mod dummy;
pub struct SingleUrlEnvironmentNoDefaultClient {
    pub config: ClientConfig,
    pub dummy: DummyClient,
}

impl SingleUrlEnvironmentNoDefaultClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            dummy: DummyClient::new(config.clone())?,
        })
    }
}

pub use dummy::*;
