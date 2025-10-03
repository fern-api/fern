use crate::{ClientConfig, ApiError, HttpClient};

pub struct CommonsClient {
    pub http_client: HttpClient,
}

impl CommonsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

}

