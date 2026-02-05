use crate::{ClientConfig, ApiError, HttpClient};

pub struct EmptyClient {
    pub http_client: HttpClient,
}

impl EmptyClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

}

