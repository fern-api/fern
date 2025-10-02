use crate::{ClientConfig, ApiError, HttpClient};

pub struct FolderBClient {
    pub http_client: HttpClient,
}

impl FolderBClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

}

