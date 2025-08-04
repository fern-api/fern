use crate::{ClientConfig, ClientError};

pub mod a;
pub mod folder;
pub struct ApiClient {
    pub config: ClientConfig,
    pub a: AClient,
    pub folder: FolderClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        Ok(Self {
            config: config.clone(),
            a: AClient::new(config.clone())?,
            folder: FolderClient::new(config.clone())?
        })
    }

}

pub use a::AClient;
pub use folder::FolderClient;
