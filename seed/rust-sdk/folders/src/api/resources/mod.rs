//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - ****
//! - **Ab**
//! - **Ac**
//! - **Folder**
//! - **FolderService**

use crate::{ClientConfig, ApiError};

pub mod ;
pub mod ab;
pub mod ac;
pub mod folder;
pub mod folder_service;
pub struct ApiClient {
    pub config: ClientConfig,
    pub : Client,
    pub ab: AbClient,
    pub ac: AcClient,
    pub folder: FolderClient,
    pub folder_service: FolderServiceClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            : Client::new(config.clone())?,
            ab: AbClient::new(config.clone())?,
            ac: AcClient::new(config.clone())?,
            folder: FolderClient::new(config.clone())?,
            folder_service: FolderServiceClient::new(config.clone())?
        })
    }

}

pub use ::Client;
pub use ab::AbClient;
pub use ac::AcClient;
pub use folder::FolderClient;
pub use folder_service::FolderServiceClient;
