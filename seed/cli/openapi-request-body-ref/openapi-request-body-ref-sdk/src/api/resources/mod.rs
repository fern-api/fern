//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Vendor**
//! - **Catalog**
//! - **TeamMember**

use crate::{ApiError, ClientConfig};

pub mod catalog;
pub mod team_member;
pub mod vendor;
pub struct ApiClient {
    pub config: ClientConfig,
    pub vendor: VendorClient,
    pub catalog: CatalogClient,
    pub team_member: TeamMemberClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            vendor: VendorClient::new(config.clone())?,
            catalog: CatalogClient::new(config.clone())?,
            team_member: TeamMemberClient::new(config.clone())?,
        })
    }
}

pub use catalog::CatalogClient;
pub use team_member::TeamMemberClient;
pub use vendor::VendorClient;
