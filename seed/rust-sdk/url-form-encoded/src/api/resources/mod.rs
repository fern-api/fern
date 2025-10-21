use crate::{ApiError, ClientConfig};

pub struct ApiClient {
    pub config: ClientConfig,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
        })
    }
}
