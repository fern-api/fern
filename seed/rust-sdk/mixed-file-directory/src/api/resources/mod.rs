//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Organization**
//! - **User**
//! - **UserEvents**
//! - **UserEventsMetadata**

use crate::{ApiError, ClientConfig};

pub mod organization;
pub mod user;
pub mod user_events;
pub mod user_events_metadata;
pub struct ApiClient {
    pub config: ClientConfig,
    pub organization: OrganizationClient,
    pub user: UserClient,
    pub user_events: UserEventsClient,
    pub user_events_metadata: UserEventsMetadataClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            organization: OrganizationClient::new(config.clone())?,
            user: UserClient::new(config.clone())?,
            user_events: UserEventsClient::new(config.clone())?,
            user_events_metadata: UserEventsMetadataClient::new(config.clone())?,
        })
    }
}

pub use organization::OrganizationClient;
pub use user::UserClient;
pub use user_events::UserEventsClient;
pub use user_events_metadata::UserEventsMetadataClient;
