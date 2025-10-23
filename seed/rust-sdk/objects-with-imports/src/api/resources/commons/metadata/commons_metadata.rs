use crate::{ApiError, ClientConfig, HttpClient};

pub struct MetadataClient {
    pub http_client: HttpClient,
}

impl MetadataClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
