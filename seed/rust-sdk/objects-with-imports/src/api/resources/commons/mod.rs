use crate::{ApiError, ClientConfig, HttpClient};

pub mod metadata;
pub use metadata::MetadataClient;
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
