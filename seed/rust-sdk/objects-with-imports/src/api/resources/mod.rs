use crate::{ApiError, ClientConfig};

pub mod commons;
pub mod file;
pub struct ObjectsWithImportsClient {
    pub config: ClientConfig,
}

impl ObjectsWithImportsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
        })
    }
}

pub use commons::CommonsClient;
pub use file::FileClient;
