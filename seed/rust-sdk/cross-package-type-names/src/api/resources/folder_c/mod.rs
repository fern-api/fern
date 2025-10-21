use crate::{ApiError, ClientConfig, HttpClient};

pub mod common;
pub use common::CommonClient2;
pub struct FolderCClient {
    pub http_client: HttpClient,
}
impl FolderCClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
