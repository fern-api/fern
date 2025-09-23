use crate::{ApiError, ClientConfig};

pub mod bigunion;
pub mod types;
pub mod union_;
pub struct UnionsClient {
    pub config: ClientConfig,
    pub bigunion: BigunionClient,
    pub union_: UnionClient,
}

impl UnionsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            bigunion: BigunionClient::new(config.clone())?,
            union_: UnionClient::new(config.clone())?,
        })
    }
}

pub use bigunion::*;
pub use types::*;
pub use union_::*;
