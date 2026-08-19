use crate::{ApiError, ClientConfig, HttpClient};

pub struct CommonClient2 {
    pub http_client: HttpClient,
}

impl CommonClient2 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
