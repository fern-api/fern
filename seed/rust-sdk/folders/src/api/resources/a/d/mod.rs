use crate::{ApiError, ClientConfig, HttpClient};

pub mod types;
pub use types::ADTypesClient;
pub struct ADClient {
    pub http_client: HttpClient,
}

impl ADClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
