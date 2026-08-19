use crate::{ApiError, ClientConfig, HttpClient};

pub struct AClient {
    pub http_client: HttpClient,
}

impl AClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
