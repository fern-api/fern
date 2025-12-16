use crate::{ApiError, ClientConfig, HttpClient};

pub mod api;
pub use api::ApiClient2;
pub struct NestedClient {
    pub http_client: HttpClient,
    pub api: ApiClient2,
}
impl NestedClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            api: ApiClient2::new(config.clone())?,
        })
    }
}
