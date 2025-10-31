use crate::{ApiError, ClientConfig, HttpClient};

pub mod events;
pub use events::EventsClient;
pub struct UserClient {
    pub http_client: HttpClient,
    pub events: EventsClient,
}
impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            events: EventsClient::new(config.clone())?,
        })
    }
}
