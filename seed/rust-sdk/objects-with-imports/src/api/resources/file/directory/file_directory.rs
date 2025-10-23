use crate::{ApiError, ClientConfig, HttpClient};

pub struct DirectoryClient {
    pub http_client: HttpClient,
}

impl DirectoryClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
