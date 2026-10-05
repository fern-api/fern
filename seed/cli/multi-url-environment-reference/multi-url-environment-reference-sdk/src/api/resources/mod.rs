//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Items**
//! - **Auth**
//! - **Files**

use crate::{ApiError, ClientConfig};

pub mod auth;
pub mod files;
pub mod items;
pub struct ApiClient {
    pub config: ClientConfig,
    pub items: ItemsClient,
    pub auth: AuthClient,
    pub files: FilesClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            items: {
                let mut cfg = config.clone();
                cfg.base_url = cfg
                    .service_url(|environment| environment.base_url())
                    .to_string();
                ItemsClient::new(cfg)?
            },
            auth: {
                let mut cfg = config.clone();
                cfg.base_url = cfg
                    .service_url(|environment| environment.auth_url())
                    .to_string();
                AuthClient::new(cfg)?
            },
            files: {
                let mut cfg = config.clone();
                cfg.base_url = cfg
                    .service_url(|environment| environment.upload_url())
                    .to_string();
                FilesClient::new(cfg)?
            },
        })
    }
}

pub use auth::AuthClient;
pub use files::FilesClient;
pub use items::ItemsClient;
