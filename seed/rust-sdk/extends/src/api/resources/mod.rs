use crate::{ApiError, ClientConfig};

pub struct ExtendsClient {
    pub config: ClientConfig,
}

impl ExtendsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
        })
    }
}
