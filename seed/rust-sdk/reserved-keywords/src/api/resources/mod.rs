use crate::{ApiError, ClientConfig};

pub mod package;
pub struct NurseryApiClient {
    pub config: ClientConfig,
    pub package: PackageClient,
}

impl NurseryApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            package: PackageClient::new(config.clone())?,
        })
    }
}

pub use package::PackageClient;
