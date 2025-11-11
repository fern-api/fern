use crate::{ApiError, ClientConfig, HttpClient};

pub mod types;
pub use types::TypesClient;
pub struct DClient {
    pub http_client: HttpClient,
}
impl DClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
