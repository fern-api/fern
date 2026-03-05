use crate::{ApiError, ClientConfig, HttpClient};

pub mod types;
pub use types::TypesClient;
pub struct Level2Client {
    pub http_client: HttpClient,
}
impl Level2Client {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
