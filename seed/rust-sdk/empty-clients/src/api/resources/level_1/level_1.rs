use crate::{ClientConfig, ApiError, HttpClient};

pub struct Level1Client {
    pub http_client: HttpClient,
}

impl Level1Client {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

}

