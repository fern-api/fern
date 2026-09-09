use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient};

pub mod messages;
pub use messages::MessagesClient2;
pub struct MessagesClient {
    pub http_client: HttpClient,
    pub messages: MessagesClient2,
}

impl MessagesClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            messages: MessagesClient2::new(config.clone())?,
        })
    }
}
