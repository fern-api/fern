use crate::{ApiError, ClientConfig};

pub struct ObjectClient {
    pub config: ClientConfig,
}

impl ObjectClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
        })
    }
}
