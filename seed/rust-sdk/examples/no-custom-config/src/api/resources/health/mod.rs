use crate::{ApiError, ClientConfig, HttpClient};

pub mod service;
pub use service::HealthServiceClient;
pub struct HealthClient {
    pub http_client: HttpClient,
    pub service: HealthServiceClient,
}
impl HealthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            service: HealthServiceClient::new(config.clone())?,
        })
    }
}
