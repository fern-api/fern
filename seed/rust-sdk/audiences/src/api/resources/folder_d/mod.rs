use crate::{ApiError, ClientConfig, HttpClient};

pub mod service;
pub use service::ServiceClient2;
pub struct FolderDClient {
    pub http_client: HttpClient,
    pub service: ServiceClient2,
}
impl FolderDClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            service: ServiceClient2::new(config.clone())?,
        })
    }
}
