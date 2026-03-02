use crate::{ApiError, ClientConfig, HttpClient};

pub struct EmptyRealtimeClient {
    pub http_client: HttpClient,
}

impl EmptyRealtimeClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
