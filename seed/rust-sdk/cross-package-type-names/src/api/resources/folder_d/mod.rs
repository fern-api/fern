use crate::{ApiError, ClientConfig, HttpClient};

pub mod service;
pub use service::FolderDServiceClient;
pub struct FolderDClient {
    pub http_client: HttpClient,
    pub service: FolderDServiceClient,
}

impl FolderDClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            service: FolderDServiceClient::new(config.clone())?,
        })
    }
}
