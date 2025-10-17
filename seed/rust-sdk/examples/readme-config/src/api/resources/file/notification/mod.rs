use crate::{ApiError, ClientConfig, HttpClient};

pub mod service;
pub use service::ServiceClient;
pub struct NotificationClient {
    pub http_client: HttpClient,
    pub service: ServiceClient,
}
impl NotificationClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            service: ServiceClient::new(config.clone())?,
        })
    }
}
