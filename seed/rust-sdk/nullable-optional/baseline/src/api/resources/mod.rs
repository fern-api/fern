//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **NullableOptional**

use crate::{ApiError, ClientConfig};

pub mod nullable_optional;
pub struct NullableOptionalClient {
    pub config: ClientConfig,
    pub nullable_optional: NullableOptionalClient2,
}

impl NullableOptionalClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            nullable_optional: NullableOptionalClient2::new(config.clone())?,
        })
    }
}

pub use nullable_optional::NullableOptionalClient2;
