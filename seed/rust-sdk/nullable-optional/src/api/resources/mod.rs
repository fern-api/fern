//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Nullableoptional**

use crate::{ApiError, ClientConfig};

pub mod nullableoptional;
pub struct ApiClient {
    pub config: ClientConfig,
    pub nullableoptional: NullableoptionalClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            nullableoptional: NullableoptionalClient::new(config.clone())?,
        })
    }
}

pub use nullableoptional::NullableoptionalClient;
