use crate::{ApiError, ClientConfig, HttpClient};

pub struct RealtimeClient {
    pub http_client: HttpClient,
}

impl RealtimeClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
