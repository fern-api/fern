use crate::{ApiError, ClientConfig};

pub mod level_1;
pub struct EmptyClientsClient {
    pub config: ClientConfig,
}

impl EmptyClientsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
        })
    }
}

pub use level_1::Level1Client;
