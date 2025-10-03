use crate::{ApiError, ClientConfig, HttpClient};

pub mod notification;
pub use notification::FileNotificationClient;
pub mod service;
pub use service::FileServiceClient;
pub struct FileClient {
    pub http_client: HttpClient,
    pub notification: FileNotificationClient,
    pub service: FileServiceClient,
}

impl FileClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            notification: FileNotificationClient::new(config.clone())?,
            service: FileServiceClient::new(config.clone())?,
        })
    }
}
