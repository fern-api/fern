use crate::{ApiError, ClientConfig, HttpClient};

pub mod service;
pub use service::FolderAServiceClient;
pub struct FolderAClient {
    pub http_client: HttpClient,
    pub service: FolderAServiceClient,
}
impl FolderAClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            service: FolderAServiceClient::new(config.clone())?,
        })
    }
}
