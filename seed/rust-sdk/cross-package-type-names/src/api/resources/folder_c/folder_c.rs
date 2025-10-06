use crate::{ClientConfig, ApiError, HttpClient};

pub struct FolderCClient {
    pub http_client: HttpClient,
}

impl FolderCClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

}

