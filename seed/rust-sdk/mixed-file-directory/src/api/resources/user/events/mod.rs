use crate::{ApiError, ClientConfig, HttpClient};

pub mod metadata;
pub use metadata::UserEventsMetadataClient;
pub struct UserEventsClient {
    pub http_client: HttpClient,
    pub metadata: UserEventsMetadataClient,
}

impl UserEventsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            metadata: UserEventsMetadataClient::new(config.clone())?,
        })
    }
}
