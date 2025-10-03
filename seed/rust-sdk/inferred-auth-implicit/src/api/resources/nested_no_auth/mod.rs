use crate::{ApiError, ClientConfig, HttpClient};

pub mod api;
pub use api::NestedNoAuthApiClient;
pub struct NestedNoAuthClient {
    pub http_client: HttpClient,
    pub api: NestedNoAuthApiClient,
}
impl NestedNoAuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            api: NestedNoAuthApiClient::new(config.clone())?,
        })
    }
}
