use crate::{ApiError, ClientConfig, HttpClient};

pub mod api;
pub use api::NestedApiClient;
pub struct NestedClient {
    pub http_client: HttpClient,
    pub api: NestedApiClient,
}
impl NestedClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            api: NestedApiClient::new(config.clone())?,
        })
    }
}
