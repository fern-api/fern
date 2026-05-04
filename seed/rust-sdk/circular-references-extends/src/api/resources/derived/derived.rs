use crate::{ApiError, ClientConfig, HttpClient};

pub struct DerivedClient {
    pub http_client: HttpClient,
}

impl DerivedClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
