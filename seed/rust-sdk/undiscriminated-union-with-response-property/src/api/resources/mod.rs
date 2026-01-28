//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::{ClientConfig, ApiError};

pub struct UndiscriminatedUnionWithResponsePropertyClient {
    pub config: ClientConfig,
}

impl UndiscriminatedUnionWithResponsePropertyClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            
        })
    }

}

