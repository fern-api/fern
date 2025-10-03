use crate::{ApiError, ClientConfig, HttpClient};

pub mod service;
pub use service::FolderServiceClient;
pub struct FolderClient {
    pub http_client: HttpClient,
    pub service: FolderServiceClient,
}

impl FolderClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            service: FolderServiceClient::new(config.clone())?,
        })
    }
}
