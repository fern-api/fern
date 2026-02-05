use crate::{ClientConfig, ApiError, HttpClient};

pub struct ErrorsClient {
    pub http_client: HttpClient,
}

impl ErrorsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

}

