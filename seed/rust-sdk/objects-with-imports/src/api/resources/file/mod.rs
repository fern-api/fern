use crate::{ApiError, ClientConfig, HttpClient};

pub mod directory;
pub use directory::DirectoryClient;
pub struct FileClient {
    pub http_client: HttpClient,
}
impl FileClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
