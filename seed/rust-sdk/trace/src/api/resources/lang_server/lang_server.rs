use crate::{ClientConfig, ApiError, HttpClient};

pub struct LangServerClient {
    pub http_client: HttpClient,
}

impl LangServerClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

}

