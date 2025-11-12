use crate::{ApiError, ClientConfig, HttpClient};

pub mod empty_realtime;
pub use empty_realtime::EmptyRealtimeClient;
pub struct EmptyClient {
    pub http_client: HttpClient,
}
impl EmptyClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
