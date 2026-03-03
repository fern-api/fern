use crate::{ApiError, ClientConfig, HttpClient};

pub mod level_2;
pub use level_2::Level2Client;
pub mod types;
pub use types::TypesClient2;
pub struct Level1Client {
    pub http_client: HttpClient,
}
impl Level1Client {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
