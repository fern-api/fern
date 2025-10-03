use crate::{ApiError, ClientConfig, HttpClient};

pub mod types;
pub use types::CommonsTypesClient;
pub struct CommonsClient {
    pub http_client: HttpClient,
}

impl CommonsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
