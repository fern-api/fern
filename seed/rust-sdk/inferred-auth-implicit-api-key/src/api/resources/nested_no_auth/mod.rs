use crate::{ApiError, ClientConfig, HttpClient};

pub mod api;
pub use api::ApiClient;
pub struct NestedNoAuthClient {
    pub http_client: HttpClient,
    pub api: ApiClient,
}
impl NestedNoAuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            api: ApiClient::new(config.clone())?,
        })
    }
}
