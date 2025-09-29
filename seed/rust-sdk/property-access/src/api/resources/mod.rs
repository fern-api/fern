use crate::{ApiError, ClientConfig};

pub struct PropertyAccessClient {
    pub config: ClientConfig,
}

impl PropertyAccessClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
        })
    }
}
