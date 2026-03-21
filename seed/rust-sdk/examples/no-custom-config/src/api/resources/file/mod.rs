use crate::{ClientConfig, ApiError, HttpClient};
use crate::api::{*};

pub mod notification;
pub use notification::NotificationClient;
pub mod service;
pub use service::ServiceClient2;
pub struct FileClient {
    pub http_client: HttpClient,
    pub notification: NotificationClient,
    pub service: ServiceClient2,
}

impl FileClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?,
    notification: NotificationClient::new(config.clone())?,
    service: ServiceClient2::new(config.clone())?
})
    }

}

