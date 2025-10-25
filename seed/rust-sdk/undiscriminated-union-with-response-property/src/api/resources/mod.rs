use crate::{ApiError, ClientConfig};

pub struct UndiscriminatedUnionWithResponsePropertyClient {
    pub config: ClientConfig,
}

impl UndiscriminatedUnionWithResponsePropertyClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
        })
    }
}
