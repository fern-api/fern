use crate::{ApiError, ClientConfig, HttpClient};

pub struct RealtimeNoAuthClient {
    pub http_client: HttpClient,
}

impl RealtimeNoAuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
