use crate::{ApiError, ClientConfig, HttpClient};

pub struct LiteralsClient {
    pub http_client: HttpClient,
}

impl LiteralsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
