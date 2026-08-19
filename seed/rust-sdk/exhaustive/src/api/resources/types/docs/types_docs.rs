use crate::{ApiError, ClientConfig, HttpClient};

pub struct DocsClient {
    pub http_client: HttpClient,
}

impl DocsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
