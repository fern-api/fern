//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **A**
//! - **Folder**

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub mod a;
pub mod folder;
pub struct ApiClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
    pub a: AClient,
    pub folder: FolderClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
            a: AClient::new(config.clone())?,
            folder: FolderClient::new(config.clone())?,
        })
    }

    pub async fn foo(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client
            .execute_request(Method::POST, "", None, None, options)
            .await
    }
}

pub use a::AClient;
pub use folder::FolderClient;
