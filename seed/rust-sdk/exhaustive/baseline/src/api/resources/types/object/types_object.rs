use crate::{ApiError, ClientConfig, HttpClient};

pub struct ObjectClient2 {
    pub http_client: HttpClient,
}

impl ObjectClient2 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
