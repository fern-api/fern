//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Commons**
//! - **FolderA**
//! - **FolderB**
//! - **FolderC**
//! - **FolderD**
//! - **Foo**

use crate::{ApiError, ClientConfig};

pub mod commons;
pub mod folder_a;
pub mod folder_b;
pub mod folder_c;
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
            foo: FooClient::new(config.clone())?,
        })
    }
}

pub use commons::CommonsClient;
pub use folder_a::FolderAClient;
pub use folder_b::FolderBClient;
pub use folder_c::FolderCClient;
pub use folder_d::FolderDClient;
pub use foo::FooClient;
