use crate::{ClientConfig, ApiError};

pub mod folder_a;
pub mod folder_d;
pub mod foo;
pub struct CrossPackageTypeNamesClient {
    pub config: ClientConfig,
    pub folder_a: FolderAClient,
    pub folder_d: FolderDClient,
    pub foo: FooClient,
}

impl CrossPackageTypeNamesClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            folder_a: FolderAClient::new(config.clone())?,
            folder_d: FolderDClient::new(config.clone())?,
            foo: FooClient::new(config.clone())?
        })
    }

}

pub use folder_a::FolderAClient;
pub use folder_d::FolderDClient;
pub use foo::FooClient;
