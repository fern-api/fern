use crate::{ApiError, ClientConfig};

pub mod realtime;
pub struct WebsocketBearerAuthClient {
    pub config: ClientConfig,
}

impl WebsocketBearerAuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
        })
    }
}

pub use realtime::RealtimeClient;
