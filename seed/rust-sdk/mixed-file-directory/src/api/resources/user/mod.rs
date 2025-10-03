use crate::{ApiError, ClientConfig, HttpClient};

pub mod events;
pub use events::UserEventsClient;
pub struct UserClient {
    pub http_client: HttpClient,
    pub events: UserEventsClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            events: UserEventsClient::new(config.clone())?,
        })
    }
}
