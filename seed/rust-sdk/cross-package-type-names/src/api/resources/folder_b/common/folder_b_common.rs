use crate::{ApiError, ClientConfig, HttpClient};

pub struct CommonClient {
    pub http_client: HttpClient,
}

impl CommonClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
