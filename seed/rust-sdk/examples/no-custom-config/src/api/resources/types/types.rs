use crate::{ApiError, ClientConfig, HttpClient};

pub struct TypesClient2 {
    pub http_client: HttpClient,
}

impl TypesClient2 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
