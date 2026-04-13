//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **FolderAService**
//! - **FolderDService**
//! - **Foo**

use crate::{ApiError, ClientConfig};

pub mod folder_a_service;
pub mod folder_d_service;
pub mod foo;
pub struct ApiClient {
    pub config: ClientConfig,
    pub folder_a_service: FolderAServiceClient,
    pub folder_d_service: FolderDServiceClient,
    pub foo: FooClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            folder_a_service: FolderAServiceClient::new(config.clone())?,
            folder_d_service: FolderDServiceClient::new(config.clone())?,
            foo: FooClient::new(config.clone())?,
        })
    }
}

pub use folder_a_service::FolderAServiceClient;
pub use folder_d_service::FolderDServiceClient;
pub use foo::FooClient;
