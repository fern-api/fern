use crate::{ApiError, ClientConfig};

pub mod realtime;
pub struct WebsocketClient {
    pub config: ClientConfig,
}

impl WebsocketClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
        })
    }
}

pub use realtime::RealtimeClient;
