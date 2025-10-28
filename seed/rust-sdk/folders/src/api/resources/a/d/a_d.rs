use crate::{ClientConfig, ApiError, HttpClient};

pub struct DClient {
    pub http_client: HttpClient,
}

impl DClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

}

