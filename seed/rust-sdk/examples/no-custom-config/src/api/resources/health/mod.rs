use crate::{ApiError, ClientConfig, HttpClient};

pub mod service;
pub use service::ServiceClient3;
pub struct HealthClient {
    pub http_client: HttpClient,
    pub service: ServiceClient3,
}
impl HealthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            service: ServiceClient3::new(config.clone())?,
        })
    }
}
