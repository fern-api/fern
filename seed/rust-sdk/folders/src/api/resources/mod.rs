//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Ab**
//! - **Ac**
//! - **Folder**
//! - **FolderService**

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub mod ab;
pub mod ac;
pub mod folder;
pub mod folder_service;
pub struct ApiClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
    pub ab: AbClient,
    pub ac: AcClient,
    pub folder: FolderClient,
    pub folder_service: FolderServiceClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
            ab: AbClient::new(config.clone())?,
            ac: AcClient::new(config.clone())?,
            folder: FolderClient::new(config.clone())?,
            folder_service: FolderServiceClient::new(config.clone())?,
        })
    }

    pub async fn foo(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client
            .execute_request(Method::POST, "", None, None, options)
            .await
    }
}

pub use ab::AbClient;
pub use ac::AcClient;
pub use folder::FolderClient;
pub use folder_service::FolderServiceClient;
