use crate::{ApiError, ClientConfig, HttpClient};

pub struct TypesUnionClient {
    pub http_client: HttpClient,
}

impl TypesUnionClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
