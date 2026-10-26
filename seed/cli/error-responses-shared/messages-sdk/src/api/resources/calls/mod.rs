use crate::{ApiError, ClientConfig, HttpClient};

pub mod calls;
pub use calls::CallsClient2;
pub struct CallsClient {
    pub http_client: HttpClient,
    pub calls: CallsClient2,
}

impl CallsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            calls: CallsClient2::new(config.clone())?,
        })
    }
}
