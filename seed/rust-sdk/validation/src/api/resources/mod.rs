use crate::{ApiError, ClientConfig};

pub struct ValidationClient {
    pub config: ClientConfig,
}

impl ValidationClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
        })
    }
}
