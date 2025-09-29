use crate::{ApiError, ClientConfig};

pub struct AliasClient {
    pub config: ClientConfig,
}

impl AliasClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
        })
    }
}
