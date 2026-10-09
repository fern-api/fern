//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **FileUploadExample**

use crate::{ApiError, ClientConfig};

pub mod file_upload_example;
pub struct ApiClient {
    pub config: ClientConfig,
    pub file_upload_example: FileUploadExampleClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            file_upload_example: FileUploadExampleClient::new(config.clone())?,
        })
    }
}

pub use file_upload_example::FileUploadExampleClient;
