use crate::{ApiError, ClientConfig, HttpClient};

pub mod common;
pub use common::CommonClient;
pub struct FolderBClient {
    pub http_client: HttpClient,
}
impl FolderBClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
