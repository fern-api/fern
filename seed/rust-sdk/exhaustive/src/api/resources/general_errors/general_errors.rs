use crate::{ClientConfig, ApiError, HttpClient};

pub struct GeneralErrorsClient {
    pub http_client: HttpClient,
}

impl GeneralErrorsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

}

