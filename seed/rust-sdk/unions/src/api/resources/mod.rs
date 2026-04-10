//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Bigunion**
//! - **Union**

use crate::{ApiError, ClientConfig};

pub mod bigunion;
pub mod union_;
pub struct ApiClient {
    pub config: ClientConfig,
    pub bigunion: BigunionClient,
    pub union_: UnionClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            bigunion: BigunionClient::new(config.clone())?,
            union_: UnionClient::new(config.clone())?,
        })
    }
}

pub use bigunion::BigunionClient;
pub use union_::UnionClient;
