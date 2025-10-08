use crate::{ApiError, ClientConfig, HttpClient};

pub struct FolderBCommonClient {
    pub http_client: HttpClient,
}

impl FolderBCommonClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
