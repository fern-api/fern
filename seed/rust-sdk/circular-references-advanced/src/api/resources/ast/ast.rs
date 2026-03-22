use crate::{ApiError, ClientConfig, HttpClient};

pub struct AstClient {
    pub http_client: HttpClient,
}

impl AstClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
