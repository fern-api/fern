use crate::{ClientConfig, ClientError};

pub mod bigunion;
pub mod union_;
pub struct UnionsClient {
    pub config: ClientConfig,
    pub bigunion: BigunionClient,
    pub union_: UnionClient,
}

impl UnionsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        Ok(Self {
            config: config.clone(),
            bigunion: BigunionClient::new(config.clone())?,
            union_: UnionClient::new(config.clone())?
        })
    }

}

pub use bigunion::BigunionClient;
pub use union_::UnionClient;
