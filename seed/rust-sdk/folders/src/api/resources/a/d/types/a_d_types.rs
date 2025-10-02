use crate::{ApiError, ClientConfig, HttpClient};

pub struct ADTypesClient {
    pub http_client: HttpClient,
}

impl ADTypesClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
