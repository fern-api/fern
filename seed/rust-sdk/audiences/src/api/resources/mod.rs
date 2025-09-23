use crate::{ApiError, ClientConfig};

pub mod commons;
pub mod folder_a;
pub mod folder_b;
pub mod folder_c;
pub mod folder_d;
pub mod foo;
pub struct AudiencesClient {
    pub config: ClientConfig,
    pub folder_a: FolderAClient,
    pub folder_d: FolderDClient,
    pub foo: FooClient,
}

impl AudiencesClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            folder_a: FolderAClient::new(config.clone())?,
            folder_d: FolderDClient::new(config.clone())?,
            foo: FooClient::new(config.clone())?,
        })
    }
}

pub use commons::*;
pub use folder_a::*;
pub use folder_b::*;
pub use folder_c::*;
pub use folder_d::*;
pub use foo::*;
