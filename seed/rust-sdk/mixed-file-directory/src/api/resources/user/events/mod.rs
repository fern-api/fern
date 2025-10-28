use crate::{ApiError, ClientConfig, HttpClient};

pub mod metadata;
pub use metadata::MetadataClient;
pub struct EventsClient {
    pub http_client: HttpClient,
    pub metadata: MetadataClient,
}
impl EventsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            metadata: MetadataClient::new(config.clone())?,
        })
    }
}
